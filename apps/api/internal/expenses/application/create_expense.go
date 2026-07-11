package application

import (
	"context"

	"caudal-api/internal/expenses/domain"
	"caudal-api/internal/expenses/ports"
	shared "caudal-api/internal/shared/domain"
)

type CreateExpense struct {
	repository ports.Repository
	checker    ports.CategoryChecker
}

func NewCreateExpense(repository ports.Repository, checker ports.CategoryChecker) CreateExpense {
	return CreateExpense{repository: repository, checker: checker}
}

func (useCase CreateExpense) Execute(ctx context.Context, command CreateExpenseCommand) (domain.Expense, error) {
	exists, err := useCase.checker.ExpenseCategoryExists(ctx, command.CategoryID)
	if err != nil {
		return domain.Expense{}, err
	}
	if !exists {
		return domain.Expense{}, domain.ErrUnknownCategory
	}
	money, err := shared.NewMoney(command.AmountCents, command.Currency)
	if err != nil {
		return domain.Expense{}, err
	}
	expense, err := domain.NewExpense(0, money, command.CategoryID, command.OccurredOn, command.Note)
	if err != nil {
		return domain.Expense{}, err
	}
	return useCase.repository.Create(ctx, expense)
}
