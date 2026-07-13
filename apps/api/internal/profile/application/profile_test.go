package application

import (
	"caudal-api/internal/profile/domain"
	"context"
	"errors"
	"testing"
)

type profileRepositoryFake struct {
	profile *domain.Profile
	getErr  error
	saveErr error
	saves   int
}

func (repo *profileRepositoryFake) GetOrCreate(_ context.Context) (domain.Profile, error) {
	if repo.getErr != nil {
		return domain.Profile{}, repo.getErr
	}
	if repo.profile == nil {
		value := domain.Empty()
		repo.profile = &value
	}
	return *repo.profile, nil
}
func (repo *profileRepositoryFake) Save(_ context.Context, profile domain.Profile) (domain.Profile, error) {
	if repo.saveErr != nil {
		return domain.Profile{}, repo.saveErr
	}
	repo.saves++
	repo.profile = &profile
	return profile, nil
}

func TestGetProfileCreatesDefaults(t *testing.T) {
	repo := &profileRepositoryFake{}
	profile, err := NewGetProfile(repo).Execute(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if profile.Concerns == nil || profile.Goals == nil || profile.Metadata == nil {
		t.Fatal("expected non-nil collection defaults")
	}
}

func TestGetProfileReturnsExistingAndPropagatesErrors(t *testing.T) {
	alias := "Luna"
	existing := domain.Empty()
	existing.Alias = &alias
	profile, err := NewGetProfile(&profileRepositoryFake{profile: &existing}).Execute(context.Background())
	if err != nil || profile.Alias == nil || *profile.Alias != alias {
		t.Fatal("expected existing profile")
	}
	want := errors.New("database unavailable")
	_, err = NewGetProfile(&profileRepositoryFake{getErr: want}).Execute(context.Background())
	if !errors.Is(err, want) {
		t.Fatalf("expected propagated error, got %v", err)
	}
}

func TestUpdateProfilePreservesOmittedAndClearsNull(t *testing.T) {
	alias, city := "Luna", "Bogotá"
	existing := domain.Empty()
	existing.Alias = &alias
	existing.City = &city
	repo := &profileRepositoryFake{profile: &existing}
	updated, err := NewUpdateProfile(repo).Execute(context.Background(), UpdateProfileCommand{Alias: Field[string]{Present: true}})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Alias != nil {
		t.Fatal("expected alias cleared")
	}
	if updated.City == nil || *updated.City != city {
		t.Fatal("expected omitted city preserved")
	}
}

func TestUpdateProfileReplacesCollections(t *testing.T) {
	existing := domain.Empty()
	existing.Concerns = []string{"deudas"}
	existing.Metadata = map[string]any{"old": true}
	concerns := []string{"ahorro"}
	goals := []domain.Goal{{Name: "Casa"}}
	metadata := map[string]any{"source": "manual"}
	updated, err := NewUpdateProfile(&profileRepositoryFake{profile: &existing}).Execute(context.Background(), UpdateProfileCommand{
		Concerns: Field[[]string]{Present: true, Value: &concerns}, Goals: Field[[]domain.Goal]{Present: true, Value: &goals}, Metadata: Field[map[string]any]{Present: true, Value: &metadata},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(updated.Concerns) != 1 || updated.Concerns[0] != "ahorro" || len(updated.Goals) != 1 || updated.Metadata["source"] != "manual" {
		t.Fatal("expected collections replaced")
	}
}

func TestUpdateProfileValidatesValues(t *testing.T) {
	tests := []UpdateProfileCommand{}
	negative := int64(-1)
	invalidYear := 1800
	invalidType := domain.IncomeType("other")
	blankGoals := []domain.Goal{{Name: " "}}
	invalidMonth := "2027-13"
	invalidMonthGoals := []domain.Goal{{Name: "Viaje", TargetDate: &invalidMonth}}
	invalidCountry := "COL"
	tests = append(tests,
		UpdateProfileCommand{EstimatedMonthlyIncome: Field[int64]{Present: true, Value: &negative}},
		UpdateProfileCommand{BirthYear: Field[int]{Present: true, Value: &invalidYear}},
		UpdateProfileCommand{IncomeType: Field[domain.IncomeType]{Present: true, Value: &invalidType}},
		UpdateProfileCommand{Goals: Field[[]domain.Goal]{Present: true, Value: &blankGoals}},
		UpdateProfileCommand{Goals: Field[[]domain.Goal]{Present: true, Value: &invalidMonthGoals}},
		UpdateProfileCommand{CountryCode: Field[string]{Present: true, Value: &invalidCountry}},
	)
	for _, command := range tests {
		if _, err := NewUpdateProfile(&profileRepositoryFake{}).Execute(context.Background(), command); err == nil {
			t.Fatal("expected validation error")
		}
	}
}

func TestUpdateProfilePropagatesRepositoryErrors(t *testing.T) {
	want := errors.New("save failed")
	_, err := NewUpdateProfile(&profileRepositoryFake{saveErr: want}).Execute(context.Background(), UpdateProfileCommand{})
	if !errors.Is(err, want) {
		t.Fatalf("expected propagated error, got %v", err)
	}
}
