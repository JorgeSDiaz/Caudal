package application

import (
	"context"

	"caudal-api/internal/incomes/domain"
	"caudal-api/internal/incomes/ports"
)

type ExportIncomes struct {
	repository ports.Repository
}

func NewExportIncomes(repository ports.Repository) ExportIncomes {
	return ExportIncomes{repository: repository}
}

func (useCase ExportIncomes) Execute(ctx context.Context) ([]domain.Income, error) {
	return useCase.repository.ListAll(ctx)
}

type ImportIncomes struct {
	create CreateIncome
}

func NewImportIncomes(create CreateIncome) ImportIncomes {
	return ImportIncomes{create: create}
}

func (useCase ImportIncomes) Execute(ctx context.Context, commands []CreateIncomeCommand) (int, error) {
	imported := 0
	for _, command := range commands {
		if _, err := useCase.create.Execute(ctx, command); err != nil {
			return imported, err
		}
		imported++
	}
	return imported, nil
}
