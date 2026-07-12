package application

import (
	"context"

	"caudal-api/internal/categories/domain"
	"caudal-api/internal/categories/ports"
)

type DeleteCategory struct {
	update UpdateCategory
}

func NewDeleteCategory(repository ports.Repository) DeleteCategory {
	return DeleteCategory{update: NewUpdateCategory(repository)}
}

func (useCase DeleteCategory) Execute(ctx context.Context, id int64) error {
	inactive := false
	_, err := useCase.update.Execute(ctx, UpdateCategoryCommand{ID: id, IsActive: &inactive})
	if err == domain.ErrSystemCategory {
		return domain.ErrSystemCategory
	}
	return err
}
