package application

import "time"

type CreateExpenseCommand struct {
	AmountCents  int64
	Currency     string
	CategoryID   int64
	OccurredOn   time.Time
	Note         *string
	RecurrenceID *int64
}

type UpdateExpenseCommand struct {
	ID           int64
	AmountCents  *int64
	Currency     *string
	CategoryID   *int64
	OccurredOn   *time.Time
	Note         **string
	RecurrenceID **int64
}

type ListExpensesQuery struct {
	Year   int
	Month  time.Month
	Limit  int
	Offset int
}
