package application

import (
	"time"

	"caudal-api/internal/recurrences/domain"
)

type CreateRecurrenceCommand struct {
	Kind             domain.Kind
	AmountCents      int64
	Currency         string
	CategoryID       int64
	Frequency        domain.Frequency
	DayOfMonth       int
	SecondDayOfMonth *int
	StartDate        time.Time
	EndDate          *time.Time
	Note             *string
}

type UpdateRecurrenceCommand struct {
	ID               int64
	AmountCents      *int64
	Currency         *string
	CategoryID       *int64
	Frequency        *domain.Frequency
	DayOfMonth       *int
	SecondDayOfMonth **int
	StartDate        *time.Time
	EndDate          **time.Time
	Note             **string
	IsActive         *bool
}
