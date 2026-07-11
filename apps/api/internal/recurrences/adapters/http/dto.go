package http

import (
	"encoding/json"
	"time"

	"caudal-api/internal/platform/httpx"
	"caudal-api/internal/recurrences/application"
	"caudal-api/internal/recurrences/domain"
)

type RecurrenceRequest struct {
	Kind             domain.Kind      `json:"kind"`
	AmountCents      int64            `json:"amount_cents"`
	Currency         string           `json:"currency"`
	CategoryID       int64            `json:"category_id"`
	Frequency        domain.Frequency `json:"frequency"`
	DayOfMonth       int              `json:"day_of_month"`
	SecondDayOfMonth *int             `json:"second_day_of_month"`
	StartDate        string           `json:"start_date"`
	EndDate          *string          `json:"end_date"`
	Note             *string          `json:"note"`
}

type RecurrenceResponse struct {
	ID               int64            `json:"id"`
	Kind             domain.Kind      `json:"kind"`
	AmountCents      int64            `json:"amount_cents"`
	Currency         string           `json:"currency"`
	CategoryID       int64            `json:"category_id"`
	Frequency        domain.Frequency `json:"frequency"`
	DayOfMonth       int              `json:"day_of_month"`
	SecondDayOfMonth *int             `json:"second_day_of_month"`
	StartDate        string           `json:"start_date"`
	EndDate          *string          `json:"end_date"`
	Note             *string          `json:"note"`
	IsActive         bool             `json:"is_active"`
	NextOccurrenceOn *string          `json:"next_occurrence_on"`
}

func (request RecurrenceRequest) Command() (application.CreateRecurrenceCommand, error) {
	startDate, err := httpx.ParseDate(request.StartDate)
	if err != nil {
		return application.CreateRecurrenceCommand{}, err
	}
	endDate, err := parseOptionalDate(request.EndDate)
	if err != nil {
		return application.CreateRecurrenceCommand{}, err
	}
	return application.CreateRecurrenceCommand{
		Kind: request.Kind, AmountCents: request.AmountCents, Currency: request.Currency,
		CategoryID: request.CategoryID, Frequency: request.Frequency,
		DayOfMonth: request.DayOfMonth, SecondDayOfMonth: request.SecondDayOfMonth,
		StartDate: startDate, EndDate: endDate, Note: request.Note,
	}, nil
}

func recurrenceResponse(item domain.Recurrence, today time.Time) RecurrenceResponse {
	endDate := formatOptionalDate(item.EndDate)
	next := formatOptionalDate(domain.NextOccurrence(item, today))
	return RecurrenceResponse{
		ID: item.ID, Kind: item.Kind, AmountCents: item.Money.AmountCents,
		Currency: item.Money.Currency, CategoryID: item.CategoryID,
		Frequency: item.Frequency, DayOfMonth: item.DayOfMonth,
		SecondDayOfMonth: item.SecondDayOfMonth, StartDate: httpx.FormatDate(item.StartDate),
		EndDate: endDate, Note: item.Note, IsActive: item.IsActive, NextOccurrenceOn: next,
	}
}

func recurrenceResponses(items []domain.Recurrence, today time.Time) []RecurrenceResponse {
	response := make([]RecurrenceResponse, 0, len(items))
	for _, item := range items {
		response = append(response, recurrenceResponse(item, today))
	}
	return response
}

func patchRecurrenceCommand(id int64, raw map[string]json.RawMessage) (application.UpdateRecurrenceCommand, error) {
	command := application.UpdateRecurrenceCommand{ID: id}
	setInt64(raw, "amount_cents", &command.AmountCents)
	setString(raw, "currency", &command.Currency)
	setInt64(raw, "category_id", &command.CategoryID)
	setFrequency(raw, "frequency", &command.Frequency)
	setInt(raw, "day_of_month", &command.DayOfMonth)
	setNullableInt(raw, "second_day_of_month", &command.SecondDayOfMonth)
	if err := setDate(raw, "start_date", &command.StartDate); err != nil {
		return command, err
	}
	if err := setNullableDate(raw, "end_date", &command.EndDate); err != nil {
		return command, err
	}
	setNullableString(raw, "note", &command.Note)
	setBool(raw, "is_active", &command.IsActive)
	return command, nil
}
