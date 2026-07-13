package application

import (
	"caudal-api/internal/profile/domain"
	"caudal-api/internal/profile/ports"
	"context"
)

type Field[T any] struct {
	Present bool
	Value   *T
}

type UpdateProfileCommand struct {
	Alias                    Field[string]
	BirthYear                Field[int]
	City                     Field[string]
	CountryCode              Field[string]
	EstimatedMonthlyIncome   Field[int64]
	EstimatedMonthlyExpenses Field[int64]
	IncomeType               Field[domain.IncomeType]
	DependentsCount          Field[int]
	Housing                  Field[domain.Housing]
	RiskTolerance            Field[domain.RiskTolerance]
	Concerns                 Field[[]string]
	Goals                    Field[[]domain.Goal]
	Metadata                 Field[map[string]any]
}

type UpdateProfile struct{ repository ports.Repository }

func NewUpdateProfile(repository ports.Repository) UpdateProfile {
	return UpdateProfile{repository: repository}
}
func (useCase UpdateProfile) Execute(ctx context.Context, command UpdateProfileCommand) (domain.Profile, error) {
	profile, err := useCase.repository.GetOrCreate(ctx)
	if err != nil {
		return domain.Profile{}, err
	}
	apply := func(present bool, set func()) {
		if present {
			set()
		}
	}
	apply(command.Alias.Present, func() { profile.Alias = command.Alias.Value })
	apply(command.BirthYear.Present, func() { profile.BirthYear = command.BirthYear.Value })
	apply(command.City.Present, func() { profile.City = command.City.Value })
	apply(command.CountryCode.Present, func() { profile.CountryCode = command.CountryCode.Value })
	apply(command.EstimatedMonthlyIncome.Present, func() { profile.EstimatedMonthlyIncome = command.EstimatedMonthlyIncome.Value })
	apply(command.EstimatedMonthlyExpenses.Present, func() { profile.EstimatedMonthlyExpenses = command.EstimatedMonthlyExpenses.Value })
	apply(command.IncomeType.Present, func() { profile.IncomeType = command.IncomeType.Value })
	apply(command.DependentsCount.Present, func() { profile.DependentsCount = command.DependentsCount.Value })
	apply(command.Housing.Present, func() { profile.Housing = command.Housing.Value })
	apply(command.RiskTolerance.Present, func() { profile.RiskTolerance = command.RiskTolerance.Value })
	apply(command.Concerns.Present, func() {
		if command.Concerns.Value == nil {
			profile.Concerns = []string{}
		} else {
			profile.Concerns = *command.Concerns.Value
		}
	})
	apply(command.Goals.Present, func() {
		if command.Goals.Value == nil {
			profile.Goals = []domain.Goal{}
		} else {
			profile.Goals = *command.Goals.Value
		}
	})
	apply(command.Metadata.Present, func() {
		if command.Metadata.Value == nil {
			profile.Metadata = map[string]any{}
		} else {
			profile.Metadata = *command.Metadata.Value
		}
	})
	if err := profile.NormalizeAndValidate(); err != nil {
		return domain.Profile{}, err
	}
	return useCase.repository.Save(ctx, profile)
}
