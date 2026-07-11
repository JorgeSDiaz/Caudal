package application

import (
	"context"

	"caudal-api/internal/categories/domain"
	"caudal-api/internal/categories/ports"
)

type ListCategories struct {
	repository ports.Repository
}

func NewListCategories(repository ports.Repository) ListCategories {
	return ListCategories{repository: repository}
}

func (useCase ListCategories) Execute(ctx context.Context, kind domain.Kind) ([]domain.Category, error) {
	return useCase.repository.List(ctx, kind)
}
