package persistence

import (
	"context"
	"time"

	"caudal-api/internal/expenses/domain"
	"caudal-api/internal/expenses/ports"
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

func (repo Repository) Create(ctx context.Context, expense domain.Expense) (domain.Expense, error) {
	model := fromDomain(expense)
	if err := repo.db.WithContext(ctx).Create(&model).Error; err != nil {
		return domain.Expense{}, err
	}
	return toDomain(model)
}

func (repo Repository) Get(ctx context.Context, id int64) (domain.Expense, error) {
	var model ExpenseModel
	err := repo.active(ctx).First(&model, "id = ?", id).Error
	return repo.mapOne(model, err)
}

func (repo Repository) List(ctx context.Context, start time.Time, end time.Time, limit int, offset int) (ports.Page, error) {
	var models []ExpenseModel
	query := repo.active(ctx).Where("occurred_on >= ? AND occurred_on < ?", start, end)
	var total int64
	if err := query.Model(&ExpenseModel{}).Count(&total).Error; err != nil {
		return ports.Page{}, err
	}
	err := query.Order("occurred_on DESC, id DESC").Limit(limit).Offset(offset).Find(&models).Error
	if err != nil {
		return ports.Page{}, err
	}
	items, err := toDomains(models)
	return ports.Page{Items: items, Total: int(total)}, err
}

func (repo Repository) ListAll(ctx context.Context) ([]domain.Expense, error) {
	var models []ExpenseModel
	err := repo.active(ctx).Order("occurred_on, id").Find(&models).Error
	if err != nil {
		return nil, err
	}
	return toDomains(models)
}

func (repo Repository) Update(ctx context.Context, expense domain.Expense) (domain.Expense, error) {
	model := fromDomain(expense)
	err := repo.db.WithContext(ctx).Model(&ExpenseModel{}).
		Where("id = ? AND deleted_at IS NULL", expense.ID).
		Updates(map[string]any{
			"amount_cents": expense.Money.AmountCents,
			"currency":     expense.Money.Currency,
			"category_id":  expense.CategoryID,
			"occurred_on":  expense.OccurredOn,
			"note":         expense.Note,
			"updated_at":   time.Now().UTC(),
		}).Error
	if err != nil {
		return domain.Expense{}, err
	}
	return repo.Get(ctx, model.ID)
}

func (repo Repository) Delete(ctx context.Context, id int64) error {
	now := time.Now().UTC()
	result := repo.db.WithContext(ctx).Model(&ExpenseModel{}).
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

func (repo Repository) mapOne(model ExpenseModel, err error) (domain.Expense, error) {
	if platformdb.IsNotFound(err) {
		return domain.Expense{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.Expense{}, err
	}
	return toDomain(model)
}

func fromDomain(expense domain.Expense) ExpenseModel {
	return ExpenseModel{
		ID: expense.ID, AmountCents: expense.Money.AmountCents,
		Currency: expense.Money.Currency, CategoryID: expense.CategoryID,
		OccurredOn: expense.OccurredOn, Note: expense.Note,
	}
}

func toDomain(model ExpenseModel) (domain.Expense, error) {
	money, err := shared.NewMoney(model.AmountCents, model.Currency)
	if err != nil {
		return domain.Expense{}, err
	}
	return domain.NewExpense(
		model.ID, money, model.CategoryID, model.OccurredOn, model.Note,
	)
}

func toDomains(models []ExpenseModel) ([]domain.Expense, error) {
	items := make([]domain.Expense, 0, len(models))
	for _, model := range models {
		item, err := toDomain(model)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
