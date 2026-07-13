package ports

import (
	"caudal-api/internal/profile/domain"
	"context"
)

type Repository interface {
	GetOrCreate(ctx context.Context) (domain.Profile, error)
	Save(ctx context.Context, profile domain.Profile) (domain.Profile, error)
}
