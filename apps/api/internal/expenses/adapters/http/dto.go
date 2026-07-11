package http

import (
	"encoding/json"
	"time"

	"caudal-api/internal/expenses/application"
	"caudal-api/internal/expenses/domain"
	"caudal-api/internal/platform/httpx"
)

type ExpenseRequest struct {
	AmountCents int64   `json:"amount_cents"`
	Currency    string  `json:"currency"`
	CategoryID  int64   `json:"category_id"`
	OccurredOn  string  `json:"occurred_on"`
	Note        *string `json:"note"`
}

type ExpenseResponse struct {
	ID          int64   `json:"id"`
	AmountCents int64   `json:"amount_cents"`
	Currency    string  `json:"currency"`
	CategoryID  int64   `json:"category_id"`
	OccurredOn  string  `json:"occurred_on"`
	Note        *string `json:"note"`
}

type ExpensePageResponse struct {
	Items []ExpenseResponse `json:"items"`
	Total int               `json:"total"`
}

func (request ExpenseRequest) Command() (application.CreateExpenseCommand, error) {
	occurredOn, err := httpx.ParseDate(request.OccurredOn)
	if err != nil {
		return application.CreateExpenseCommand{}, err
	}
	return application.CreateExpenseCommand{
		AmountCents: request.AmountCents, Currency: request.Currency,
		CategoryID: request.CategoryID, OccurredOn: occurredOn, Note: request.Note,
	}, nil
}

func expenseResponse(expense domain.Expense) ExpenseResponse {
	return ExpenseResponse{
		ID: expense.ID, AmountCents: expense.Money.AmountCents,
		Currency: expense.Money.Currency, CategoryID: expense.CategoryID,
		OccurredOn: httpx.FormatDate(expense.OccurredOn), Note: expense.Note,
	}
}

func expensePage(items []domain.Expense, total int) ExpensePageResponse {
	response := ExpensePageResponse{Items: []ExpenseResponse{}, Total: total}
	for _, item := range items {
		response.Items = append(response.Items, expenseResponse(item))
	}
	return response
}

func patchExpenseCommand(id int64, raw map[string]json.RawMessage) (application.UpdateExpenseCommand, error) {
	command := application.UpdateExpenseCommand{ID: id}
	if err := setInt64(raw, "amount_cents", &command.AmountCents); err != nil {
		return command, err
	}
	if err := setString(raw, "currency", &command.Currency); err != nil {
		return command, err
	}
	if err := setInt64(raw, "category_id", &command.CategoryID); err != nil {
		return command, err
	}
	if err := setDate(raw, "occurred_on", &command.OccurredOn); err != nil {
		return command, err
	}
	return command, setNullableString(raw, "note", &command.Note)
}

func setDate(raw map[string]json.RawMessage, key string, target **time.Time) error {
	var value string
	if !decodeOptional(raw, key, &value) {
		return nil
	}
	parsed, err := httpx.ParseDate(value)
	if err != nil {
		return err
	}
	*target = &parsed
	return nil
}
