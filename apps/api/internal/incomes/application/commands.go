package application

import "time"

type CreateIncomeCommand struct {
	AmountCents  int64
	Currency     string
	SourceID     int64
	OccurredOn   time.Time
	Note         *string
	RecurrenceID *int64
}

type UpdateIncomeCommand struct {
	ID           int64
	AmountCents  *int64
	Currency     *string
	SourceID     *int64
	OccurredOn   *time.Time
	Note         **string
	RecurrenceID **int64
}

type ListIncomesQuery struct {
	Year   int
	Month  time.Month
	Limit  int
	Offset int
}
