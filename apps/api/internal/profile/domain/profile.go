package domain

import (
	"errors"
	"strings"
	"time"
)

type IncomeType string
type Housing string
type RiskTolerance string

const (
	IncomeFixed    IncomeType    = "fixed"
	IncomeVariable IncomeType    = "variable"
	IncomeMixed    IncomeType    = "mixed"
	HousingRent    Housing       = "rent"
	HousingOwned   Housing       = "owned"
	HousingFamily  Housing       = "family"
	RiskLow        RiskTolerance = "low"
	RiskMedium     RiskTolerance = "medium"
	RiskHigh       RiskTolerance = "high"
)

type Goal struct {
	Name         string
	TargetAmount *int64
	TargetDate   *string
}

type Profile struct {
	Alias                    *string
	BirthYear                *int
	City                     *string
	CountryCode              *string
	EstimatedMonthlyIncome   *int64
	EstimatedMonthlyExpenses *int64
	IncomeType               *IncomeType
	DependentsCount          *int
	Housing                  *Housing
	RiskTolerance            *RiskTolerance
	Concerns                 []string
	Goals                    []Goal
	Metadata                 map[string]any
	CreatedAt                time.Time
	UpdatedAt                time.Time
}

func Empty() Profile {
	return Profile{Concerns: []string{}, Goals: []Goal{}, Metadata: map[string]any{}}
}

func (profile *Profile) NormalizeAndValidate() error {
	profile.Alias = normalizeText(profile.Alias)
	profile.City = normalizeText(profile.City)
	profile.CountryCode = normalizeText(profile.CountryCode)
	if profile.CountryCode != nil {
		code := strings.ToUpper(*profile.CountryCode)
		if len(code) != 2 || code[0] < 'A' || code[0] > 'Z' || code[1] < 'A' || code[1] > 'Z' {
			return errors.New("country_code must be an ISO 3166-1 alpha-2 code")
		}
		profile.CountryCode = &code
	}
	if profile.BirthYear != nil && (*profile.BirthYear < 1900 || *profile.BirthYear > 2100) {
		return errors.New("birth_year must be between 1900 and 2100")
	}
	if profile.EstimatedMonthlyIncome != nil && *profile.EstimatedMonthlyIncome < 0 {
		return errors.New("estimated_monthly_income must be non-negative")
	}
	if profile.EstimatedMonthlyExpenses != nil && *profile.EstimatedMonthlyExpenses < 0 {
		return errors.New("estimated_monthly_expenses must be non-negative")
	}
	if profile.DependentsCount != nil && *profile.DependentsCount < 0 {
		return errors.New("dependents_count must be non-negative")
	}
	if profile.IncomeType != nil && *profile.IncomeType != IncomeFixed && *profile.IncomeType != IncomeVariable && *profile.IncomeType != IncomeMixed {
		return errors.New("unsupported income_type")
	}
	if profile.Housing != nil && *profile.Housing != HousingRent && *profile.Housing != HousingOwned && *profile.Housing != HousingFamily {
		return errors.New("unsupported housing")
	}
	if profile.RiskTolerance != nil && *profile.RiskTolerance != RiskLow && *profile.RiskTolerance != RiskMedium && *profile.RiskTolerance != RiskHigh {
		return errors.New("unsupported risk_tolerance")
	}
	if profile.Concerns == nil {
		profile.Concerns = []string{}
	}
	for index, concern := range profile.Concerns {
		profile.Concerns[index] = strings.TrimSpace(concern)
	}
	if profile.Goals == nil {
		profile.Goals = []Goal{}
	}
	for index := range profile.Goals {
		profile.Goals[index].Name = strings.TrimSpace(profile.Goals[index].Name)
		if profile.Goals[index].Name == "" {
			return errors.New("goal name is required")
		}
		if profile.Goals[index].TargetAmount != nil && *profile.Goals[index].TargetAmount < 0 {
			return errors.New("goal target_amount must be non-negative")
		}
		if profile.Goals[index].TargetDate != nil {
			if _, err := time.Parse("2006-01", *profile.Goals[index].TargetDate); err != nil {
				return errors.New("goal target_date must use YYYY-MM")
			}
		}
	}
	if profile.Metadata == nil {
		profile.Metadata = map[string]any{}
	}
	return nil
}

func normalizeText(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
