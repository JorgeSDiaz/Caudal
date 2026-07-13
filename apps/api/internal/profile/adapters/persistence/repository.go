package persistence

import (
	"caudal-api/internal/profile/domain"
	"context"
	"encoding/json"
	"gorm.io/gorm"
)

type Repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) Repository { return Repository{db: db} }

func (repo Repository) GetOrCreate(ctx context.Context) (domain.Profile, error) {
	if err := repo.db.WithContext(ctx).Exec("INSERT INTO profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING").Error; err != nil {
		return domain.Profile{}, err
	}
	var model ProfileModel
	if err := repo.db.WithContext(ctx).First(&model, "id = ?", 1).Error; err != nil {
		return domain.Profile{}, err
	}
	return toDomain(model)
}

func (repo Repository) Save(ctx context.Context, profile domain.Profile) (domain.Profile, error) {
	model := fromDomain(profile)
	model.ID = 1
	err := repo.db.WithContext(ctx).Model(&ProfileModel{}).Where("id = ?", 1).Updates(map[string]any{
		"alias": model.Alias, "birth_year": model.BirthYear, "city": model.City, "country_code": model.CountryCode,
		"estimated_monthly_income":   model.EstimatedMonthlyIncome,
		"estimated_monthly_expenses": model.EstimatedMonthlyExpenses,
		"income_type":                model.IncomeType, "dependents_count": model.DependentsCount,
		"housing": model.Housing, "risk_tolerance": model.RiskTolerance,
		"concerns": model.Concerns, "goals": model.Goals, "metadata": model.Metadata,
		"updated_at": gorm.Expr("now()"),
	}).Error
	if err != nil {
		return domain.Profile{}, err
	}
	var saved ProfileModel
	if err := repo.db.WithContext(ctx).First(&saved, "id = ?", 1).Error; err != nil {
		return domain.Profile{}, err
	}
	return toDomain(saved)
}

type goalJSON struct {
	Name         string  `json:"name"`
	TargetAmount *int64  `json:"target_amount"`
	TargetDate   *string `json:"target_date"`
}

func fromDomain(profile domain.Profile) ProfileModel {
	goals := make([]goalJSON, 0, len(profile.Goals))
	for _, goal := range profile.Goals {
		goals = append(goals, goalJSON{Name: goal.Name, TargetAmount: goal.TargetAmount, TargetDate: goal.TargetDate})
	}
	goalsJSON, _ := json.Marshal(goals)
	metadataJSON, _ := json.Marshal(profile.Metadata)
	return ProfileModel{Alias: profile.Alias, BirthYear: profile.BirthYear, City: profile.City, CountryCode: profile.CountryCode,
		EstimatedMonthlyIncome: profile.EstimatedMonthlyIncome, EstimatedMonthlyExpenses: profile.EstimatedMonthlyExpenses,
		IncomeType: stringPointer(profile.IncomeType), DependentsCount: profile.DependentsCount,
		Housing: housingPointer(profile.Housing), RiskTolerance: riskPointer(profile.RiskTolerance),
		Concerns: StringArray(profile.Concerns), Goals: goalsJSON, Metadata: metadataJSON,
		CreatedAt: profile.CreatedAt, UpdatedAt: profile.UpdatedAt}
}

func toDomain(model ProfileModel) (domain.Profile, error) {
	var rawGoals []goalJSON
	if err := json.Unmarshal(model.Goals, &rawGoals); err != nil {
		return domain.Profile{}, err
	}
	metadata := map[string]any{}
	if err := json.Unmarshal(model.Metadata, &metadata); err != nil {
		return domain.Profile{}, err
	}
	goals := make([]domain.Goal, 0, len(rawGoals))
	for _, raw := range rawGoals {
		if raw.TargetDate != nil && len(*raw.TargetDate) == len("2006-01-02") {
			normalized := (*raw.TargetDate)[:7]
			raw.TargetDate = &normalized
		}
		goals = append(goals, domain.Goal{Name: raw.Name, TargetAmount: raw.TargetAmount, TargetDate: raw.TargetDate})
	}
	profile := domain.Profile{Alias: model.Alias, BirthYear: model.BirthYear, City: model.City, CountryCode: model.CountryCode,
		EstimatedMonthlyIncome: model.EstimatedMonthlyIncome, EstimatedMonthlyExpenses: model.EstimatedMonthlyExpenses,
		IncomeType: incomeTypePointer(model.IncomeType), DependentsCount: model.DependentsCount,
		Housing: domainHousingPointer(model.Housing), RiskTolerance: domainRiskPointer(model.RiskTolerance),
		Concerns: []string(model.Concerns), Goals: goals, Metadata: metadata, CreatedAt: model.CreatedAt, UpdatedAt: model.UpdatedAt}
	if profile.Concerns == nil {
		profile.Concerns = []string{}
	}
	return profile, nil
}

func stringPointer[T ~string](value *T) *string {
	if value == nil {
		return nil
	}
	result := string(*value)
	return &result
}
func housingPointer(value *domain.Housing) *string    { return stringPointer(value) }
func riskPointer(value *domain.RiskTolerance) *string { return stringPointer(value) }
func incomeTypePointer(value *string) *domain.IncomeType {
	if value == nil {
		return nil
	}
	result := domain.IncomeType(*value)
	return &result
}
func domainHousingPointer(value *string) *domain.Housing {
	if value == nil {
		return nil
	}
	result := domain.Housing(*value)
	return &result
}
func domainRiskPointer(value *string) *domain.RiskTolerance {
	if value == nil {
		return nil
	}
	result := domain.RiskTolerance(*value)
	return &result
}
