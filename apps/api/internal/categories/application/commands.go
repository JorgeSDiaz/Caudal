package application

import "caudal-api/internal/categories/domain"

type CreateCategoryCommand struct {
	Name string
	Icon *string
	Kind domain.Kind
}

type UpdateCategoryCommand struct {
	ID       int64
	Name     *string
	Icon     **string
	IsActive *bool
}
