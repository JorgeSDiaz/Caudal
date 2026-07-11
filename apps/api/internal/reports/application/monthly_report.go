package application

import (
	"context"
	"time"

	"caudal-api/internal/reports/domain"
	"caudal-api/internal/reports/ports"
	shared "caudal-api/internal/shared/domain"
)

type MonthlyReportQuery struct {
	Year  int
	Month time.Month
}

type MonthlyReport struct {
	expenses ports.MonthlyExpenseReader
	incomes  ports.MonthlyIncomeReader
}

func NewMonthlyReport(expenses ports.MonthlyExpenseReader, incomes ports.MonthlyIncomeReader) MonthlyReport {
	return MonthlyReport{expenses: expenses, incomes: incomes}
}

func (useCase MonthlyReport) Execute(ctx context.Context, query MonthlyReportQuery) (domain.MonthlyReport, error) {
	previousYear, previousMonth := shared.PreviousFinancialMonth(query.Year, query.Month)
	expenseTotal, err := useCase.expenses.TotalForMonth(ctx, query.Year, int(query.Month))
	if err != nil {
		return domain.MonthlyReport{}, err
	}
	previousExpenseTotal, err := useCase.expenses.TotalForMonth(ctx, previousYear, int(previousMonth))
	if err != nil {
		return domain.MonthlyReport{}, err
	}
	incomeTotal, err := useCase.incomes.TotalForMonth(ctx, query.Year, int(query.Month))
	if err != nil {
		return domain.MonthlyReport{}, err
	}
	previousIncomeTotal, err := useCase.incomes.TotalForMonth(ctx, previousYear, int(previousMonth))
	if err != nil {
		return domain.MonthlyReport{}, err
	}
	return useCase.compose(ctx, query, expenseTotal, previousExpenseTotal, incomeTotal, previousIncomeTotal)
}

func (useCase MonthlyReport) compose(ctx context.Context, query MonthlyReportQuery, expenseTotal int64, previousExpenseTotal int64, incomeTotal int64, previousIncomeTotal int64) (domain.MonthlyReport, error) {
	byCategory, err := useCase.expenses.BreakdownForMonth(ctx, query.Year, int(query.Month))
	if err != nil {
		return domain.MonthlyReport{}, err
	}
	bySource, err := useCase.incomes.BreakdownForMonth(ctx, query.Year, int(query.Month))
	if err != nil {
		return domain.MonthlyReport{}, err
	}
	return domain.MonthlyReport{
		Year: query.Year, Month: int(query.Month),
		ExpenseTotalCents: expenseTotal, PreviousMonthExpenseTotalCents: previousExpenseTotal,
		IncomeTotalCents: incomeTotal, PreviousMonthIncomeTotalCents: previousIncomeTotal,
		NetCents: incomeTotal - expenseTotal, ByCategory: byCategory, BySource: bySource,
	}, nil
}
