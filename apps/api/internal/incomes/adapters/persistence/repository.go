package persistence

import (
	"context"
	"time"

	"caudal-api/internal/incomes/domain"
	"caudal-api/internal/incomes/ports"
	platformdb "caudal-api/internal/platform/persistence"
	shared "caudal-api/internal/shared/domain"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return Repository{db: db}
}

func (repo Repository) Create(ctx context.Context, income domain.Income) (domain.Income, error) {
	model := fromDomain(income)
	if err := repo.db.WithContext(ctx).Create(&model).Error; err != nil {
		return domain.Income{}, err
	}
	return toDomain(model)
}

func (repo Repository) Get(ctx context.Context, id int64) (domain.Income, error) {
	var model IncomeModel
	err := repo.active(ctx).First(&model, "id = ?", id).Error
	return repo.mapOne(model, err)
}

func (repo Repository) List(ctx context.Context, start time.Time, end time.Time, limit int, offset int) (ports.Page, error) {
	var models []IncomeModel
	query := repo.active(ctx).Where("occurred_on >= ? AND occurred_on < ?", start, end)
	var total int64
	if err := query.Model(&IncomeModel{}).Count(&total).Error; err != nil {
		return ports.Page{}, err
	}
	err := query.Order("occurred_on DESC, id DESC").Limit(limit).Offset(offset).Find(&models).Error
	if err != nil {
		return ports.Page{}, err
	}
	items, err := toDomains(models)
	return ports.Page{Items: items, Total: int(total)}, err
}

func (repo Repository) ListAll(ctx context.Context) ([]domain.Income, error) {
	var models []IncomeModel
	err := repo.active(ctx).Order("occurred_on, id").Find(&models).Error
	if err != nil {
		return nil, err
	}
	return toDomains(models)
}

func (repo Repository) Update(ctx context.Context, income domain.Income) (domain.Income, error) {
	err := repo.db.WithContext(ctx).Model(&IncomeModel{}).
		Where("id = ? AND deleted_at IS NULL", income.ID).
		Updates(map[string]any{
			"amount_cents": income.Money.AmountCents,
			"currency":     income.Money.Currency,
			"source_id":    income.SourceID,
			"occurred_on":  income.OccurredOn,
			"note":         income.Note,
			"updated_at":   time.Now().UTC(),
		}).Error
	if err != nil {
		return domain.Income{}, err
	}
	return repo.Get(ctx, income.ID)
}

func (repo Repository) Delete(ctx context.Context, id int64) error {
	now := time.Now().UTC()
	result := repo.db.WithContext(ctx).Model(&IncomeModel{}).
		Where("id = ? AND deleted_at IS NULL", id).Update("deleted_at", now)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (repo Repository) active(ctx context.Context) *gorm.DB {
	return repo.db.WithContext(ctx).Where("deleted_at IS NULL")
}

func (repo Repository) mapOne(model IncomeModel, err error) (domain.Income, error) {
	if platformdb.IsNotFound(err) {
		return domain.Income{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.Income{}, err
	}
	return toDomain(model)
}

func fromDomain(income domain.Income) IncomeModel {
	return IncomeModel{
		ID: income.ID, AmountCents: income.Money.AmountCents,
		Currency: income.Money.Currency, SourceID: income.SourceID,
		OccurredOn: income.OccurredOn, Note: income.Note,
	}
}

func toDomain(model IncomeModel) (domain.Income, error) {
	money, err := shared.NewMoney(model.AmountCents, model.Currency)
	if err != nil {
		return domain.Income{}, err
	}
	return domain.NewIncome(model.ID, money, model.SourceID, model.OccurredOn, model.Note)
}

func toDomains(models []IncomeModel) ([]domain.Income, error) {
	items := make([]domain.Income, 0, len(models))
	for _, model := range models {
		item, err := toDomain(model)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
