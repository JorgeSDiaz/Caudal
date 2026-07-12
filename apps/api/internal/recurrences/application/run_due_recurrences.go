package application

import (
	"context"
	"time"

	"caudal-api/internal/recurrences/domain"
	"caudal-api/internal/recurrences/ports"
)

type RunDueRecurrences struct {
	repository ports.Repository
	writer     ports.MovementWriter
}

func NewRunDueRecurrences(repository ports.Repository, writer ports.MovementWriter) RunDueRecurrences {
	return RunDueRecurrences{repository: repository, writer: writer}
}

func (useCase RunDueRecurrences) Execute(ctx context.Context, today time.Time) (int, error) {
	recurrences, err := useCase.repository.ListActive(ctx)
	if err != nil {
		return 0, err
	}
	generated := 0
	for _, recurrence := range recurrences {
		count, err := useCase.materialize(ctx, recurrence, today)
		if err != nil {
			return generated, err
		}
		generated += count
	}
	return generated, nil
}

func (useCase RunDueRecurrences) materialize(ctx context.Context, recurrence domain.Recurrence, today time.Time) (int, error) {
	occurrences := domain.DueOccurrences(recurrence, today)
	for _, occurrence := range occurrences {
		err := useCase.writer.Create(ctx, recurrence, occurrence)
		if err != nil {
			return 0, err
		}
	}
	if len(occurrences) > 0 {
		if err := useCase.repository.MarkGenerated(ctx, recurrence.ID, occurrences[len(occurrences)-1]); err != nil {
			return 0, err
		}
	}
	return len(occurrences), nil
}
