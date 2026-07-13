package http

import (
	"caudal-api/internal/profile/application"
	"caudal-api/internal/profile/domain"
	"encoding/json"
	"fmt"
	"time"
)

type GoalDTO struct {
	Name         string  `json:"name"`
	TargetAmount *int64  `json:"target_amount"`
	TargetDate   *string `json:"target_date"`
}
type ProfileResponse struct {
	Alias                    *string               `json:"alias"`
	BirthYear                *int                  `json:"birth_year"`
	City                     *string               `json:"city"`
	CountryCode              *string               `json:"country_code"`
	EstimatedMonthlyIncome   *int64                `json:"estimated_monthly_income"`
	EstimatedMonthlyExpenses *int64                `json:"estimated_monthly_expenses"`
	IncomeType               *domain.IncomeType    `json:"income_type"`
	DependentsCount          *int                  `json:"dependents_count"`
	Housing                  *domain.Housing       `json:"housing"`
	RiskTolerance            *domain.RiskTolerance `json:"risk_tolerance"`
	Concerns                 []string              `json:"concerns"`
	Goals                    []GoalDTO             `json:"goals"`
	Metadata                 map[string]any        `json:"metadata"`
	CreatedAt                time.Time             `json:"created_at"`
	UpdatedAt                time.Time             `json:"updated_at"`
}

func profileResponse(profile domain.Profile) ProfileResponse {
	goals := make([]GoalDTO, 0, len(profile.Goals))
	for _, goal := range profile.Goals {
		goals = append(goals, GoalDTO{Name: goal.Name, TargetAmount: goal.TargetAmount, TargetDate: goal.TargetDate})
	}
	return ProfileResponse{Alias: profile.Alias, BirthYear: profile.BirthYear, City: profile.City, CountryCode: profile.CountryCode,
		EstimatedMonthlyIncome: profile.EstimatedMonthlyIncome, EstimatedMonthlyExpenses: profile.EstimatedMonthlyExpenses,
		IncomeType: profile.IncomeType, DependentsCount: profile.DependentsCount, Housing: profile.Housing,
		RiskTolerance: profile.RiskTolerance, Concerns: profile.Concerns, Goals: goals, Metadata: profile.Metadata,
		CreatedAt: profile.CreatedAt, UpdatedAt: profile.UpdatedAt}
}

func updateCommand(raw map[string]json.RawMessage) (application.UpdateProfileCommand, error) {
	var command application.UpdateProfileCommand
	var err error
	if command.Alias, err = decodeField[string](raw, "alias"); err != nil {
		return command, err
	}
	if command.BirthYear, err = decodeField[int](raw, "birth_year"); err != nil {
		return command, err
	}
	if command.City, err = decodeField[string](raw, "city"); err != nil {
		return command, err
	}
	if command.CountryCode, err = decodeField[string](raw, "country_code"); err != nil {
		return command, err
	}
	if command.EstimatedMonthlyIncome, err = decodeField[int64](raw, "estimated_monthly_income"); err != nil {
		return command, err
	}
	if command.EstimatedMonthlyExpenses, err = decodeField[int64](raw, "estimated_monthly_expenses"); err != nil {
		return command, err
	}
	if command.IncomeType, err = decodeField[domain.IncomeType](raw, "income_type"); err != nil {
		return command, err
	}
	if command.DependentsCount, err = decodeField[int](raw, "dependents_count"); err != nil {
		return command, err
	}
	if command.Housing, err = decodeField[domain.Housing](raw, "housing"); err != nil {
		return command, err
	}
	if command.RiskTolerance, err = decodeField[domain.RiskTolerance](raw, "risk_tolerance"); err != nil {
		return command, err
	}
	if command.Concerns, err = decodeField[[]string](raw, "concerns"); err != nil {
		return command, err
	}
	var goals application.Field[[]GoalDTO]
	if goals, err = decodeField[[]GoalDTO](raw, "goals"); err != nil {
		return command, err
	}
	command.Goals.Present = goals.Present
	if goals.Value != nil {
		parsed := make([]domain.Goal, 0, len(*goals.Value))
		for _, goal := range *goals.Value {
			parsed = append(parsed, domain.Goal{Name: goal.Name, TargetAmount: goal.TargetAmount, TargetDate: goal.TargetDate})
		}
		command.Goals.Value = &parsed
	}
	if command.Metadata, err = decodeField[map[string]any](raw, "metadata"); err != nil {
		return command, err
	}
	return command, nil
}

func decodeField[T any](raw map[string]json.RawMessage, key string) (application.Field[T], error) {
	value, present := raw[key]
	field := application.Field[T]{Present: present}
	if !present || string(value) == "null" {
		return field, nil
	}
	var decoded T
	if err := json.Unmarshal(value, &decoded); err != nil {
		return field, fmt.Errorf("invalid %s: %w", key, err)
	}
	field.Value = &decoded
	return field, nil
}
