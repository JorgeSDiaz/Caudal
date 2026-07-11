package ports

import (
	"context"
	"time"

	"caudal-api/internal/incomes/domain"
)

type Page struct {
	Items []domain.Income
	Total int
}

type Repository interface {
	Create(context.Context, domain.Income) (domain.Income, error)
	Get(context.Context, int64) (domain.Income, error)
	List(context.Context, time.Time, time.Time, int, int) (Page, error)
	ListAll(context.Context) ([]domain.Income, error)
	Update(context.Context, domain.Income) (domain.Income, error)
	Delete(context.Context, int64) error
}
