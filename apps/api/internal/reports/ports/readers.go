package ports

import (
	"context"

	"caudal-api/internal/reports/domain"
)

type MonthlyExpenseReader interface {
	TotalForMonth(context.Context, int, int) (int64, error)
	BreakdownForMonth(context.Context, int, int) ([]domain.CategoryBreakdown, error)
}

type MonthlyIncomeReader interface {
	TotalForMonth(context.Context, int, int) (int64, error)
	BreakdownForMonth(context.Context, int, int) ([]domain.SourceBreakdown, error)
}
