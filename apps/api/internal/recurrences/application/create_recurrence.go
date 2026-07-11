package application

import (
	"context"

	"caudal-api/internal/recurrences/domain"
	"caudal-api/internal/recurrences/ports"
	shared "caudal-api/internal/shared/domain"
)

type CreateRecurrence struct {
	repository ports.Repository
	checker    ports.CategoryChecker
}

func NewCreateRecurrence(repository ports.Repository, checker ports.CategoryChecker) CreateRecurrence {
	return CreateRecurrence{repository: repository, checker: checker}
}

func (useCase CreateRecurrence) Execute(ctx context.Context, command CreateRecurrenceCommand) (domain.Recurrence, error) {
	if err := useCase.ensureCategory(ctx, command.Kind, command.CategoryID); err != nil {
		return domain.Recurrence{}, err
	}
	money, err := shared.NewMoney(command.AmountCents, command.Currency)
	if err != nil {
		return domain.Recurrence{}, err
	}
	item, err := domain.NewRecurrence(domain.Recurrence{
		Kind: command.Kind, Money: money, CategoryID: command.CategoryID,
		Frequency: command.Frequency, DayOfMonth: command.DayOfMonth,
		SecondDayOfMonth: command.SecondDayOfMonth, StartDate: command.StartDate,
		EndDate: command.EndDate, Note: command.Note, IsActive: true,
	})
	if err != nil {
		return domain.Recurrence{}, err
	}
	return useCase.repository.Create(ctx, item)
}

func (useCase CreateRecurrence) ensureCategory(ctx context.Context, kind domain.Kind, id int64) error {
	exists, err := useCase.checker.RecurrenceCategoryExists(ctx, kind, id)
	if err != nil {
		return err
	}
	if !exists {
		return domain.ErrUnknownCategory
	}
	return nil
}
