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

func (writer MovementWriter) Create(ctx context.Context, kind domain.Kind, amountCents int64, currency string, categoryID int64, occurredOn time.Time, note *string) error {
	table, categoryColumn := "expense", "category_id"
	if kind == domain.IncomeKind {
		table, categoryColumn = "income", "source_id"
	}
	return writer.db.WithContext(ctx).Table(table).Create(map[string]any{
		"amount_cents": amountCents,
		"currency":     currency,
		categoryColumn: categoryID,
		"occurred_on":  occurredOn,
		"note":         note,
	}).Error
}
