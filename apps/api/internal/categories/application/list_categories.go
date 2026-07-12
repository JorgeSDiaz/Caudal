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

type ListCategoriesQuery struct {
	Kind            domain.Kind
	IncludeInactive bool
}

func (useCase ListCategories) Execute(ctx context.Context, query ListCategoriesQuery) ([]domain.Category, error) {
	return useCase.repository.List(ctx, query.Kind, query.IncludeInactive)
}
