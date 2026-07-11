package application

import (
	"context"

	"caudal-api/internal/expenses/ports"
	shared "caudal-api/internal/shared/domain"
)

type ListExpenses struct {
	repository ports.Repository
}

func NewListExpenses(repository ports.Repository) ListExpenses {
	return ListExpenses{repository: repository}
}

func (useCase ListExpenses) Execute(ctx context.Context, query ListExpensesQuery) (ports.Page, error) {
	start, end := shared.FinancialMonthBounds(query.Year, query.Month)
	return useCase.repository.List(ctx, start, end, query.Limit, query.Offset)
}
