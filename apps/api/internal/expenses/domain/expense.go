package domain

import (
	"errors"
	"time"

	shared "caudal-api/internal/shared/domain"
)

var (
	ErrNotFound        = errors.New("expense not found")
	ErrUnknownCategory = errors.New("unknown expense category")
)

type Expense struct {
	ID         int64
	Money      shared.Money
	CategoryID int64
	OccurredOn time.Time
	Note       *string
}

func NewExpense(id int64, money shared.Money, categoryID int64, occurredOn time.Time, note *string) (Expense, error) {
	if money.AmountCents <= 0 {
		return Expense{}, errors.New("an expense amount must be positive")
	}
	if categoryID <= 0 {
		return Expense{}, errors.New("category_id must be positive")
	}
	return Expense{ID: id, Money: money, CategoryID: categoryID, OccurredOn: occurredOn, Note: note}, nil
}
