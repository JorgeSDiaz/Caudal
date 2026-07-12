package persistence

import (
	"context"

	"caudal-api/internal/categories/domain"
	platformpersistence "caudal-api/internal/platform/persistence"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return Repository{db: db}
}

func (repo Repository) List(ctx context.Context, kind domain.Kind, includeInactive bool) ([]domain.Category, error) {
	var models []CategoryModel
	query := repo.db.WithContext(ctx).
		Where("kind = ?", string(kind)).
		Order("sort_order, id")
	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}
	err := query.Find(&models).Error
	if err != nil {
		return nil, err
	}
	items := make([]domain.Category, 0, len(models))
	for _, model := range models {
		items = append(items, toDomain(model))
	}
	return items, nil
}

func (repo Repository) Get(ctx context.Context, id int64) (domain.Category, error) {
	var model CategoryModel
	err := repo.db.WithContext(ctx).First(&model, "id = ?", id).Error
	if platformpersistence.IsNotFound(err) {
		return domain.Category{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.Category{}, err
	}
	return toDomain(model), nil
}

func (repo Repository) Create(ctx context.Context, category domain.Category) (domain.Category, error) {
	model := fromDomain(category)
	if err := repo.db.WithContext(ctx).Create(&model).Error; err != nil {
		return domain.Category{}, err
	}
	return toDomain(model), nil
}

func (repo Repository) Update(ctx context.Context, category domain.Category) (domain.Category, error) {
	model := fromDomain(category)
	err := repo.db.WithContext(ctx).Model(&CategoryModel{}).
		Where("id = ?", category.ID).
		Updates(map[string]any{
			"name":      model.Name,
			"icon":      model.Icon,
			"is_active": model.IsActive,
		}).Error
	if err != nil {
		return domain.Category{}, err
	}
	return repo.Get(ctx, category.ID)
}

func (repo Repository) Exists(ctx context.Context, id int64, kind domain.Kind) (bool, error) {
	var count int64
	err := repo.db.WithContext(ctx).Model(&CategoryModel{}).
		Where("id = ? AND kind = ? AND is_active = ?", id, string(kind), true).
		Count(&count).Error
	return count > 0, err
}

func (repo Repository) NameExists(ctx context.Context, name string, kind domain.Kind, exceptID *int64) (bool, error) {
	var count int64
	query := repo.db.WithContext(ctx).Model(&CategoryModel{}).
		Where("name = ? AND kind = ?", name, string(kind))
	if exceptID != nil {
		query = query.Where("id <> ?", *exceptID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}

func (repo Repository) NextSortOrder(ctx context.Context, kind domain.Kind) (int, error) {
	var maxOrder int
	err := repo.db.WithContext(ctx).Model(&CategoryModel{}).
		Where("kind = ?", string(kind)).
		Select("coalesce(max(sort_order), 0)").
		Scan(&maxOrder).Error
	return maxOrder + 1, err
}

func (repo Repository) ExpenseCategoryExists(ctx context.Context, id int64) (bool, error) {
	return repo.Exists(ctx, id, domain.ExpenseKind)
}

func (repo Repository) IncomeSourceExists(ctx context.Context, id int64) (bool, error) {
	return repo.Exists(ctx, id, domain.IncomeKind)
}

func toDomain(model CategoryModel) domain.Category {
	return domain.Category{
		ID:        model.ID,
		Name:      model.Name,
		Icon:      model.Icon,
		SortOrder: model.SortOrder,
		Kind:      domain.Kind(model.Kind),
		IsSystem:  model.IsSystem,
		IsActive:  model.IsActive,
	}
}

func fromDomain(category domain.Category) CategoryModel {
	return CategoryModel{
		ID: category.ID, Name: category.Name, Icon: category.Icon, SortOrder: category.SortOrder,
		IsSystem: category.IsSystem, IsActive: category.IsActive, Kind: string(category.Kind),
	}
}
