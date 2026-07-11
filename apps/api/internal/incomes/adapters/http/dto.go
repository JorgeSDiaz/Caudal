package http

import (
	"encoding/json"
	"time"

	"caudal-api/internal/incomes/application"
	"caudal-api/internal/incomes/domain"
	"caudal-api/internal/platform/httpx"
)

type IncomeRequest struct {
	AmountCents int64   `json:"amount_cents"`
	Currency    string  `json:"currency"`
	SourceID    int64   `json:"source_id"`
	OccurredOn  string  `json:"occurred_on"`
	Note        *string `json:"note"`
}

type IncomeResponse struct {
	ID          int64   `json:"id"`
	AmountCents int64   `json:"amount_cents"`
	Currency    string  `json:"currency"`
	SourceID    int64   `json:"source_id"`
	OccurredOn  string  `json:"occurred_on"`
	Note        *string `json:"note"`
}

type IncomePageResponse struct {
	Items []IncomeResponse `json:"items"`
	Total int              `json:"total"`
}

func (request IncomeRequest) Command() (application.CreateIncomeCommand, error) {
	occurredOn, err := httpx.ParseDate(request.OccurredOn)
	if err != nil {
		return application.CreateIncomeCommand{}, err
	}
	return application.CreateIncomeCommand{
		AmountCents: request.AmountCents, Currency: request.Currency,
		SourceID: request.SourceID, OccurredOn: occurredOn, Note: request.Note,
	}, nil
}

func incomeResponse(income domain.Income) IncomeResponse {
	return IncomeResponse{
		ID: income.ID, AmountCents: income.Money.AmountCents,
		Currency: income.Money.Currency, SourceID: income.SourceID,
		OccurredOn: httpx.FormatDate(income.OccurredOn), Note: income.Note,
	}
}

func incomePage(items []domain.Income, total int) IncomePageResponse {
	response := IncomePageResponse{Items: []IncomeResponse{}, Total: total}
	for _, item := range items {
		response.Items = append(response.Items, incomeResponse(item))
	}
	return response
}

func patchIncomeCommand(id int64, raw map[string]json.RawMessage) (application.UpdateIncomeCommand, error) {
	command := application.UpdateIncomeCommand{ID: id}
	if err := setInt64(raw, "amount_cents", &command.AmountCents); err != nil {
		return command, err
	}
	if err := setString(raw, "currency", &command.Currency); err != nil {
		return command, err
	}
	if err := setInt64(raw, "source_id", &command.SourceID); err != nil {
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
