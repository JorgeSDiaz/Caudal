package http

import (
	expenseapp "caudal-api/internal/expenses/application"
	incomeapp "caudal-api/internal/incomes/application"
	"caudal-api/internal/platform/httpx"
)

type BackupDocument struct {
	Expenses []MovementRequest `json:"expenses"`
	Incomes  []MovementRequest `json:"incomes"`
}

type MovementRequest struct {
	AmountCents int64   `json:"amount_cents"`
	Currency    string  `json:"currency"`
	CategoryID  int64   `json:"category_id,omitempty"`
	SourceID    int64   `json:"source_id,omitempty"`
	OccurredOn  string  `json:"occurred_on"`
	Note        *string `json:"note"`
}

func (document BackupDocument) ExpenseCommands() ([]expenseapp.CreateExpenseCommand, error) {
	commands := make([]expenseapp.CreateExpenseCommand, 0, len(document.Expenses))
	for _, item := range document.Expenses {
		date, err := httpx.ParseDate(item.OccurredOn)
		if err != nil {
			return nil, err
		}
		commands = append(commands, expenseapp.CreateExpenseCommand{
			AmountCents: item.AmountCents, Currency: item.Currency,
			CategoryID: item.CategoryID, OccurredOn: date, Note: item.Note,
		})
	}
	return commands, nil
}

func (document BackupDocument) IncomeCommands() ([]incomeapp.CreateIncomeCommand, error) {
	commands := make([]incomeapp.CreateIncomeCommand, 0, len(document.Incomes))
	for _, item := range document.Incomes {
		date, err := httpx.ParseDate(item.OccurredOn)
		if err != nil {
			return nil, err
		}
		commands = append(commands, incomeapp.CreateIncomeCommand{
			AmountCents: item.AmountCents, Currency: item.Currency,
			SourceID: item.SourceID, OccurredOn: date, Note: item.Note,
		})
	}
	return commands, nil
}
