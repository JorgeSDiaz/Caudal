package application

import (
	"context"

	"caudal-api/internal/incomes/domain"
	"caudal-api/internal/incomes/ports"
	shared "caudal-api/internal/shared/domain"
)

type UpdateIncome struct {
	repository ports.Repository
	checker    ports.SourceChecker
}

func NewUpdateIncome(repository ports.Repository, checker ports.SourceChecker) UpdateIncome {
	return UpdateIncome{repository: repository, checker: checker}
}

func (useCase UpdateIncome) Execute(ctx context.Context, command UpdateIncomeCommand) (domain.Income, error) {
	income, err := useCase.repository.Get(ctx, command.ID)
	if err != nil {
		return domain.Income{}, err
	}
	if err := useCase.applyChanges(ctx, &income, command); err != nil {
		return domain.Income{}, err
	}
	return useCase.repository.Update(ctx, income)
}

func (useCase UpdateIncome) applyChanges(ctx context.Context, income *domain.Income, command UpdateIncomeCommand) error {
	if command.SourceID != nil {
		exists, err := useCase.checker.IncomeSourceExists(ctx, *command.SourceID)
		if err != nil || !exists {
			if err != nil {
				return err
			}
			return domain.ErrUnknownSource
		}
		income.SourceID = *command.SourceID
	}
	if command.AmountCents != nil || command.Currency != nil {
		amount, currency := income.Money.AmountCents, income.Money.Currency
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
		income.Money = money
	}
	if command.OccurredOn != nil {
		income.OccurredOn = *command.OccurredOn
	}
	if command.Note != nil {
		income.Note = *command.Note
	}
	if command.RecurrenceID != nil {
		income.RecurrenceID = *command.RecurrenceID
	}
	return nil
}
