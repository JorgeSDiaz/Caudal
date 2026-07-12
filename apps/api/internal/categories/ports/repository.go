package ports

import (
	"context"

	"caudal-api/internal/categories/domain"
)

type Repository interface {
	List(ctx context.Context, kind domain.Kind, includeInactive bool) ([]domain.Category, error)
	Get(ctx context.Context, id int64) (domain.Category, error)
	Create(ctx context.Context, category domain.Category) (domain.Category, error)
	Update(ctx context.Context, category domain.Category) (domain.Category, error)
	Exists(ctx context.Context, id int64, kind domain.Kind) (bool, error)
	NameExists(ctx context.Context, name string, kind domain.Kind, exceptID *int64) (bool, error)
	NextSortOrder(ctx context.Context, kind domain.Kind) (int, error)
}
