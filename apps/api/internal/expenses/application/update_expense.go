package application

import (
	"context"

	"caudal-api/internal/expenses/domain"
	"caudal-api/internal/expenses/ports"
	shared "caudal-api/internal/shared/domain"
)

type UpdateExpense struct {
	repository ports.Repository
	checker    ports.CategoryChecker
}

func NewUpdateExpense(repository ports.Repository, checker ports.CategoryChecker) UpdateExpense {
	return UpdateExpense{repository: repository, checker: checker}
}

func (useCase UpdateExpense) Execute(ctx context.Context, command UpdateExpenseCommand) (domain.Expense, error) {
	expense, err := useCase.repository.Get(ctx, command.ID)
	if err != nil {
		return domain.Expense{}, err
	}
	if err := useCase.applyChanges(ctx, &expense, command); err != nil {
		return domain.Expense{}, err
	}
	return useCase.repository.Update(ctx, expense)
}

func (useCase UpdateExpense) applyChanges(ctx context.Context, expense *domain.Expense, command UpdateExpenseCommand) error {
	if command.CategoryID != nil {
		exists, err := useCase.checker.ExpenseCategoryExists(ctx, *command.CategoryID)
		if err != nil || !exists {
			if err != nil {
				return err
			}
			return domain.ErrUnknownCategory
		}
		expense.CategoryID = *command.CategoryID
	}
	if command.AmountCents != nil || command.Currency != nil {
		amount, currency := expense.Money.AmountCents, expense.Money.Currency
		if command.AmountCents != nil {
			amount = *command.AmountCents
		}
		if command.Currency != nil {
			currency = *command.Currency
		}
		money, err := shared.NewMoney(amount, currency)
		if err != nil {
			return err
		}
		expense.Money = money
	}
	if command.OccurredOn != nil {
		expense.OccurredOn = *command.OccurredOn
	}
	if command.Note != nil {
		expense.Note = *command.Note
	}
	if command.RecurrenceID != nil {
		expense.RecurrenceID = *command.RecurrenceID
	}
	return nil
}
