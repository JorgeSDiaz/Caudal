package persistence

import (
	"context"
	"time"

	platformdb "caudal-api/internal/platform/persistence"
	"caudal-api/internal/recurrences/domain"
	shared "caudal-api/internal/shared/domain"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return Repository{db: db}
}

func (repo Repository) Create(ctx context.Context, item domain.Recurrence) (domain.Recurrence, error) {
	model := fromDomain(item)
	if err := repo.db.WithContext(ctx).Create(&model).Error; err != nil {
		return domain.Recurrence{}, err
	}
	return toDomain(model)
}

func (repo Repository) Get(ctx context.Context, id int64) (domain.Recurrence, error) {
	var model RecurrenceModel
	err := repo.active(ctx).First(&model, "id = ?", id).Error
	return mapOne(model, err)
}

func (repo Repository) List(ctx context.Context, kind *domain.Kind) ([]domain.Recurrence, error) {
	var models []RecurrenceModel
	query := repo.active(ctx).Order("id DESC")
	if kind != nil {
		query = query.Where("kind = ?", string(*kind))
	}
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}
	return toDomains(models)
}

func (repo Repository) ListActive(ctx context.Context) ([]domain.Recurrence, error) {
	var models []RecurrenceModel
	err := repo.active(ctx).Where("is_active = ?", true).Order("id").Find(&models).Error
	if err != nil {
		return nil, err
	}
	return toDomains(models)
}

func (repo Repository) Update(ctx context.Context, item domain.Recurrence) (domain.Recurrence, error) {
	err := repo.db.WithContext(ctx).Model(&RecurrenceModel{}).
		Where("id = ? AND deleted_at IS NULL", item.ID).
		Updates(map[string]any{
			"amount_cents":        item.Money.AmountCents,
			"currency":            item.Money.Currency,
			"category_id":         item.CategoryID,
			"frequency":           string(item.Frequency),
			"day_of_month":        item.DayOfMonth,
			"second_day_of_month": item.SecondDayOfMonth,
			"start_date":          item.StartDate,
			"end_date":            item.EndDate,
			"note":                item.Note,
			"is_active":           item.IsActive,
			"updated_at":          time.Now().UTC(),
		}).Error
	if err != nil {
		return domain.Recurrence{}, err
	}
	return repo.Get(ctx, item.ID)
}

func (repo Repository) Delete(ctx context.Context, id int64) error {
	now := time.Now().UTC()
	result := repo.db.WithContext(ctx).Model(&RecurrenceModel{}).
		Where("id = ? AND deleted_at IS NULL", id).Update("deleted_at", now)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (repo Repository) MarkGenerated(ctx context.Context, id int64, date time.Time) error {
	return repo.db.WithContext(ctx).Model(&RecurrenceModel{}).
		Where("id = ? AND deleted_at IS NULL", id).
		Updates(map[string]any{"last_generated_on": date, "updated_at": time.Now().UTC()}).Error
}

func (repo Repository) active(ctx context.Context) *gorm.DB {
	return repo.db.WithContext(ctx).Where("deleted_at IS NULL")
}

func mapOne(model RecurrenceModel, err error) (domain.Recurrence, error) {
	if platformdb.IsNotFound(err) {
		return domain.Recurrence{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.Recurrence{}, err
	}
	return toDomain(model)
}

func fromDomain(item domain.Recurrence) RecurrenceModel {
	return RecurrenceModel{
		ID: item.ID, Kind: string(item.Kind), AmountCents: item.Money.AmountCents,
		Currency: item.Money.Currency, CategoryID: item.CategoryID,
		Frequency: string(item.Frequency), DayOfMonth: item.DayOfMonth,
		SecondDayOfMonth: item.SecondDayOfMonth, StartDate: item.StartDate,
		EndDate: item.EndDate, Note: item.Note, IsActive: item.IsActive,
		LastGeneratedOn: item.LastGeneratedOn, UpdatedAt: time.Now().UTC(),
	}
}

func toDomain(model RecurrenceModel) (domain.Recurrence, error) {
	money, err := shared.NewMoney(model.AmountCents, model.Currency)
	if err != nil {
		return domain.Recurrence{}, err
	}
	return domain.NewRecurrence(domain.Recurrence{
		ID: model.ID, Kind: domain.Kind(model.Kind), Money: money,
		CategoryID: model.CategoryID, Frequency: domain.Frequency(model.Frequency),
		DayOfMonth: model.DayOfMonth, SecondDayOfMonth: model.SecondDayOfMonth,
		StartDate: model.StartDate, EndDate: model.EndDate, Note: model.Note,
		IsActive: model.IsActive, LastGeneratedOn: model.LastGeneratedOn,
	})
}

func toDomains(models []RecurrenceModel) ([]domain.Recurrence, error) {
	items := make([]domain.Recurrence, 0, len(models))
	for _, model := range models {
		item, err := toDomain(model)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}
