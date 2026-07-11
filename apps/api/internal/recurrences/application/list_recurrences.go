package application

import (
	"context"

	"caudal-api/internal/recurrences/domain"
	"caudal-api/internal/recurrences/ports"
)

type ListRecurrences struct {
	repository ports.Repository
}

func NewListRecurrences(repository ports.Repository) ListRecurrences {
	return ListRecurrences{repository: repository}
}

func (useCase ListRecurrences) Execute(ctx context.Context, kind *domain.Kind) ([]domain.Recurrence, error) {
	return useCase.repository.List(ctx, kind)
}
