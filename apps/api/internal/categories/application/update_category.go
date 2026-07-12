package application

import (
	"context"

	"caudal-api/internal/categories/domain"
	"caudal-api/internal/categories/ports"
)

type UpdateCategory struct {
	repository ports.Repository
}

func NewUpdateCategory(repository ports.Repository) UpdateCategory {
	return UpdateCategory{repository: repository}
}

func (useCase UpdateCategory) Execute(ctx context.Context, command UpdateCategoryCommand) (domain.Category, error) {
	category, err := useCase.repository.Get(ctx, command.ID)
	if err != nil {
		return domain.Category{}, err
	}
	if command.Name != nil {
		name, err := domain.NormalizeName(*command.Name)
		if err != nil {
			return domain.Category{}, err
		}
		exists, err := useCase.repository.NameExists(ctx, name, category.Kind, &category.ID)
		if err != nil {
			return domain.Category{}, err
		}
		if exists {
			return domain.Category{}, domain.ErrDuplicateName
		}
		category.Name = name
	}
	if command.Icon != nil {
		icon, err := domain.NormalizeIcon(*command.Icon)
		if err != nil {
			return domain.Category{}, err
		}
		category.Icon = icon
	}
	if command.IsActive != nil {
		if category.IsSystem && !*command.IsActive {
			return domain.Category{}, domain.ErrSystemCategory
		}
		category.IsActive = *command.IsActive
	}
	return useCase.repository.Update(ctx, category)
}
