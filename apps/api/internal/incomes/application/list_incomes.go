package application

import (
	"context"

	"caudal-api/internal/incomes/ports"
	shared "caudal-api/internal/shared/domain"
)

type ListIncomes struct {
	repository ports.Repository
}

func NewListIncomes(repository ports.Repository) ListIncomes {
	return ListIncomes{repository: repository}
}

func (useCase ListIncomes) Execute(ctx context.Context, query ListIncomesQuery) (ports.Page, error) {
	start, end := shared.FinancialMonthBounds(query.Year, query.Month)
	return useCase.repository.List(ctx, start, end, query.Limit, query.Offset)
}
