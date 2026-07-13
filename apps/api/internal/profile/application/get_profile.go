package application

import (
	"caudal-api/internal/profile/domain"
	"caudal-api/internal/profile/ports"
	"context"
)

type GetProfile struct{ repository ports.Repository }

func NewGetProfile(repository ports.Repository) GetProfile { return GetProfile{repository: repository} }
func (useCase GetProfile) Execute(ctx context.Context) (domain.Profile, error) {
	return useCase.repository.GetOrCreate(ctx)
}
