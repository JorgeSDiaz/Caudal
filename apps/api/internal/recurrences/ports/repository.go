package ports

import (
	"context"
	"time"

	"caudal-api/internal/recurrences/domain"
)

type Repository interface {
	Create(context.Context, domain.Recurrence) (domain.Recurrence, error)
	Get(context.Context, int64) (domain.Recurrence, error)
	List(context.Context, *domain.Kind) ([]domain.Recurrence, error)
	ListActive(context.Context) ([]domain.Recurrence, error)
	Update(context.Context, domain.Recurrence) (domain.Recurrence, error)
	Delete(context.Context, int64) error
	MarkGenerated(context.Context, int64, time.Time) error
}
