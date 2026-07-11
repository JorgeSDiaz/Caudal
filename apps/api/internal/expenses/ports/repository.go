package ports

import (
	"context"
	"time"

	"caudal-api/internal/expenses/domain"
)

type Page struct {
	Items []domain.Expense
	Total int
}

type Repository interface {
	Create(context.Context, domain.Expense) (domain.Expense, error)
	Get(context.Context, int64) (domain.Expense, error)
	List(context.Context, time.Time, time.Time, int, int) (Page, error)
	ListAll(context.Context) ([]domain.Expense, error)
	Update(context.Context, domain.Expense) (domain.Expense, error)
	Delete(context.Context, int64) error
}
