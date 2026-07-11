package application

import (
	"context"

	"caudal-api/internal/incomes/ports"
)

type DeleteIncome struct {
	repository ports.Repository
}

func NewDeleteIncome(repository ports.Repository) DeleteIncome {
	return DeleteIncome{repository: repository}
}

func (useCase DeleteIncome) Execute(ctx context.Context, id int64) error {
	return useCase.repository.Delete(ctx, id)
}
