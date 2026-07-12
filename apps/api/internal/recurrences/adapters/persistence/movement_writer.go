package persistence

import (
	"context"
	"time"

	"caudal-api/internal/recurrences/domain"
	"gorm.io/gorm"
)

type MovementWriter struct {
	db *gorm.DB
}

func NewMovementWriter(db *gorm.DB) MovementWriter {
	return MovementWriter{db: db}
}

func (writer MovementWriter) Create(ctx context.Context, recurrence domain.Recurrence, occurredOn time.Time) error {
	table, categoryColumn := "expense", "category_id"
	if recurrence.Kind == domain.IncomeKind {
		table, categoryColumn = "income", "source_id"
	}
	return writer.db.WithContext(ctx).Table(table).Create(map[string]any{
		"amount_cents":  recurrence.Money.AmountCents,
		"currency":      recurrence.Money.Currency,
		categoryColumn:  recurrence.CategoryID,
		"occurred_on":   occurredOn,
		"note":          recurrence.Note,
		"recurrence_id": recurrence.ID,
	}).Error
}
