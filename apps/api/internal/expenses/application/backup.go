package application

import (
	"context"

	"caudal-api/internal/expenses/domain"
	"caudal-api/internal/expenses/ports"
)

type ExportExpenses struct {
	repository ports.Repository
}

func NewExportExpenses(repository ports.Repository) ExportExpenses {
	return ExportExpenses{repository: repository}
}

func (useCase ExportExpenses) Execute(ctx context.Context) ([]domain.Expense, error) {
	return useCase.repository.ListAll(ctx)
}

type ImportExpenses struct {
	create CreateExpense
}

func NewImportExpenses(create CreateExpense) ImportExpenses {
	return ImportExpenses{create: create}
}

func (useCase ImportExpenses) Execute(ctx context.Context, commands []CreateExpenseCommand) (int, error) {
	imported := 0
	for _, command := range commands {
		if _, err := useCase.create.Execute(ctx, command); err != nil {
			return imported, err
		}
		imported++
	}
	return imported, nil
}
