package persistence

import (
	"context"

	"caudal-api/internal/categories/domain"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return Repository{db: db}
}

func (repo Repository) List(ctx context.Context, kind domain.Kind) ([]domain.Category, error) {
	var models []CategoryModel
	err := repo.db.WithContext(ctx).
		Where("kind = ? AND is_active = ?", string(kind), true).
		Order("sort_order, id").
		Find(&models).Error
	if err != nil {
		return nil, err
	}
	items := make([]domain.Category, 0, len(models))
	for _, model := range models {
		items = append(items, toDomain(model))
	}
	return items, nil
}

func (repo Repository) Exists(ctx context.Context, id int64, kind domain.Kind) (bool, error) {
	var count int64
	err := repo.db.WithContext(ctx).Model(&CategoryModel{}).
		Where("id = ? AND kind = ? AND is_active = ?", id, string(kind), true).
		Count(&count).Error
	return count > 0, err
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
	}
}
