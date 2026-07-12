package application

import (
	"context"

	"caudal-api/internal/incomes/domain"
	"caudal-api/internal/incomes/ports"
	shared "caudal-api/internal/shared/domain"
)

type CreateIncome struct {
	repository ports.Repository
	checker    ports.SourceChecker
}

func NewCreateIncome(repository ports.Repository, checker ports.SourceChecker) CreateIncome {
	return CreateIncome{repository: repository, checker: checker}
}

func (useCase CreateIncome) Execute(ctx context.Context, command CreateIncomeCommand) (domain.Income, error) {
	exists, err := useCase.checker.IncomeSourceExists(ctx, command.SourceID)
	if err != nil {
		return domain.Income{}, err
	}
	if !exists {
		return domain.Income{}, domain.ErrUnknownSource
	}
	money, err := shared.NewMoney(command.AmountCents, command.Currency)
	if err != nil {
		return domain.Income{}, err
	}
	income, err := domain.NewIncome(
		0, money, command.SourceID, command.OccurredOn, command.Note, command.RecurrenceID,
	)
	if err != nil {
		return domain.Income{}, err
	}
	return useCase.repository.Create(ctx, income)
}
