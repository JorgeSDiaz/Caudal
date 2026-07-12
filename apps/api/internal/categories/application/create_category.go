package application

import (
	"context"

	"caudal-api/internal/categories/domain"
	"caudal-api/internal/categories/ports"
)

type CreateCategory struct {
	repository ports.Repository
}

func NewCreateCategory(repository ports.Repository) CreateCategory {
	return CreateCategory{repository: repository}
}

func (useCase CreateCategory) Execute(ctx context.Context, command CreateCategoryCommand) (domain.Category, error) {
	name, err := domain.NormalizeName(command.Name)
	if err != nil {
		return domain.Category{}, err
	}
	icon, err := domain.NormalizeIcon(command.Icon)
	if err != nil {
		return domain.Category{}, err
	}
	exists, err := useCase.repository.NameExists(ctx, name, command.Kind, nil)
	if err != nil {
		return domain.Category{}, err
	}
	if exists {
		return domain.Category{}, domain.ErrDuplicateName
	}
	sortOrder, err := useCase.repository.NextSortOrder(ctx, command.Kind)
	if err != nil {
		return domain.Category{}, err
	}
	category, err := domain.NewCategory(0, name, icon, sortOrder, command.Kind, false, true)
	if err != nil {
		return domain.Category{}, err
	}
	return useCase.repository.Create(ctx, category)
}
