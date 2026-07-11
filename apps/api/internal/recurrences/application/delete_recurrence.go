package application

import (
	"context"

	"caudal-api/internal/recurrences/ports"
)

type DeleteRecurrence struct {
	repository ports.Repository
}

func NewDeleteRecurrence(repository ports.Repository) DeleteRecurrence {
	return DeleteRecurrence{repository: repository}
}

func (useCase DeleteRecurrence) Execute(ctx context.Context, id int64) error {
	return useCase.repository.Delete(ctx, id)
}
