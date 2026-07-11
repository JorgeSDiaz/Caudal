package application

import (
	"context"

	"caudal-api/internal/recurrences/domain"
	"caudal-api/internal/recurrences/ports"
	shared "caudal-api/internal/shared/domain"
)

type UpdateRecurrence struct {
	repository ports.Repository
	checker    ports.CategoryChecker
}

func NewUpdateRecurrence(repository ports.Repository, checker ports.CategoryChecker) UpdateRecurrence {
	return UpdateRecurrence{repository: repository, checker: checker}
}

func (useCase UpdateRecurrence) Execute(ctx context.Context, command UpdateRecurrenceCommand) (domain.Recurrence, error) {
	item, err := useCase.repository.Get(ctx, command.ID)
	if err != nil {
		return domain.Recurrence{}, err
	}
	if err := useCase.applyChanges(ctx, &item, command); err != nil {
		return domain.Recurrence{}, err
	}
	item, err = domain.NewRecurrence(item)
	if err != nil {
		return domain.Recurrence{}, err
	}
	return useCase.repository.Update(ctx, item)
}

func (useCase UpdateRecurrence) applyChanges(ctx context.Context, item *domain.Recurrence, command UpdateRecurrenceCommand) error {
	if command.CategoryID != nil {
		exists, err := useCase.checker.RecurrenceCategoryExists(ctx, item.Kind, *command.CategoryID)
		if err != nil || !exists {
			if err != nil {
				return err
			}
			return domain.ErrUnknownCategory
		}
		item.CategoryID = *command.CategoryID
	}
	if command.AmountCents != nil || command.Currency != nil {
		amount, currency := item.Money.AmountCents, item.Money.Currency
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
		item.Money = money
	}
	applySimple(item, command)
	return nil
}

func applySimple(item *domain.Recurrence, command UpdateRecurrenceCommand) {
	if command.Frequency != nil {
		item.Frequency = *command.Frequency
	}
	if command.DayOfMonth != nil {
		item.DayOfMonth = *command.DayOfMonth
	}
	if command.SecondDayOfMonth != nil {
		item.SecondDayOfMonth = *command.SecondDayOfMonth
	}
	if command.StartDate != nil {
		item.StartDate = *command.StartDate
	}
	if command.EndDate != nil {
		item.EndDate = *command.EndDate
	}
	if command.Note != nil {
		item.Note = *command.Note
	}
	if command.IsActive != nil {
		item.IsActive = *command.IsActive
	}
}
