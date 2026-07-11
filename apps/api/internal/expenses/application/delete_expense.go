package application

import (
	"context"

	"caudal-api/internal/expenses/ports"
)

type DeleteExpense struct {
	repository ports.Repository
}

func NewDeleteExpense(repository ports.Repository) DeleteExpense {
	return DeleteExpense{repository: repository}
}

func (useCase DeleteExpense) Execute(ctx context.Context, id int64) error {
	return useCase.repository.Delete(ctx, id)
}
