package ports

import (
	"context"

	"caudal-api/internal/categories/domain"
)

type Repository interface {
	List(ctx context.Context, kind domain.Kind) ([]domain.Category, error)
	Exists(ctx context.Context, id int64, kind domain.Kind) (bool, error)
}
