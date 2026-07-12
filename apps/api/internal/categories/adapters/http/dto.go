package http

import "caudal-api/internal/categories/domain"

type CategoryResponse struct {
	ID        int64       `json:"id"`
	Name      string      `json:"name"`
	Icon      *string     `json:"icon"`
	SortOrder int         `json:"sort_order"`
	Kind      domain.Kind `json:"kind"`
	IsSystem  bool        `json:"is_system"`
	IsActive  bool        `json:"is_active"`
}

type CategoryRequest struct {
	Name string      `json:"name"`
	Icon *string     `json:"icon"`
	Kind domain.Kind `json:"kind"`
}

func categoryResponse(category domain.Category) CategoryResponse {
	return CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		Icon:      category.Icon,
		SortOrder: category.SortOrder,
		Kind:      category.Kind,
		IsSystem:  category.IsSystem,
		IsActive:  category.IsActive,
	}
}

func categoryResponses(categories []domain.Category) []CategoryResponse {
	response := make([]CategoryResponse, 0, len(categories))
	for _, category := range categories {
		response = append(response, categoryResponse(category))
	}
	return response
}
