package application

import (
	"context"
	"errors"
	"testing"

	"caudal-api/internal/categories/domain"
)

func TestCreateCategory(t *testing.T) {
	ctx := context.Background()
	repo := newCategoryRepositoryFake()
	useCase := NewCreateCategory(repo)

	category, err := useCase.Execute(ctx, CreateCategoryCommand{
		Name: "  Impuestos  ", Kind: domain.ExpenseKind, Icon: stringPtr("Receipt"),
	})
	if err != nil {
		t.Fatalf("expected category to be created: %v", err)
	}
	if category.Name != "Impuestos" {
		t.Fatalf("expected trimmed name, got %q", category.Name)
	}
	if category.IsSystem {
		t.Fatal("expected custom category")
	}
	if !category.IsActive {
		t.Fatal("expected active category")
	}
}

func TestCreateCategoryRejectsDuplicateWithinKind(t *testing.T) {
	ctx := context.Background()
	repo := newCategoryRepositoryFake()
	repo.seed(t, "Sueldo", domain.IncomeKind, false, true)
	useCase := NewCreateCategory(repo)

	_, err := useCase.Execute(ctx, CreateCategoryCommand{
		Name: "Sueldo", Kind: domain.IncomeKind, Icon: stringPtr("Wallet"),
	})
	if !errors.Is(err, domain.ErrDuplicateName) {
		t.Fatalf("expected duplicate name error, got %v", err)
	}
}

func TestCreateCategoryAllowsSameNameAcrossKinds(t *testing.T) {
	ctx := context.Background()
	repo := newCategoryRepositoryFake()
	repo.seed(t, "Otros", domain.ExpenseKind, true, true)
	useCase := NewCreateCategory(repo)

	category, err := useCase.Execute(ctx, CreateCategoryCommand{
		Name: "Otros", Kind: domain.IncomeKind, Icon: stringPtr("HelpCircle"),
	})
	if err != nil {
		t.Fatalf("expected same name in another kind to be allowed: %v", err)
	}
	if category.Kind != domain.IncomeKind {
		t.Fatalf("expected income category, got %s", category.Kind)
	}
}

func TestCreateCategoryRejectsUnsupportedIcon(t *testing.T) {
	ctx := context.Background()
	useCase := NewCreateCategory(newCategoryRepositoryFake())

	_, err := useCase.Execute(ctx, CreateCategoryCommand{
		Name: "Impuestos", Kind: domain.ExpenseKind, Icon: stringPtr("NotAnIcon"),
	})
	if err == nil {
		t.Fatal("expected unsupported icon error")
	}
}

func TestDeleteCategoryRejectsSystemCategory(t *testing.T) {
	ctx := context.Background()
	repo := newCategoryRepositoryFake()
	category := repo.seed(t, "Comida", domain.ExpenseKind, true, true)
	useCase := NewDeleteCategory(repo)

	err := useCase.Execute(ctx, category.ID)
	if !errors.Is(err, domain.ErrSystemCategory) {
		t.Fatalf("expected system category error, got %v", err)
	}
}

func TestDeleteCategoryDeactivatesCustomCategory(t *testing.T) {
	ctx := context.Background()
	repo := newCategoryRepositoryFake()
	category := repo.seed(t, "Impuestos", domain.ExpenseKind, false, true)
	useCase := NewDeleteCategory(repo)

	if err := useCase.Execute(ctx, category.ID); err != nil {
		t.Fatalf("expected delete to deactivate category: %v", err)
	}
	updated, err := repo.Get(ctx, category.ID)
	if err != nil {
		t.Fatalf("expected category to remain stored: %v", err)
	}
	if updated.IsActive {
		t.Fatal("expected inactive category")
	}
	active, err := repo.List(ctx, domain.ExpenseKind, false)
	if err != nil {
		t.Fatalf("expected list: %v", err)
	}
	if len(active) != 0 {
		t.Fatalf("expected inactive category hidden from normal list, got %d", len(active))
	}
}

type categoryRepositoryFake struct {
	nextID int64
	items  map[int64]domain.Category
}

func newCategoryRepositoryFake() *categoryRepositoryFake {
	return &categoryRepositoryFake{nextID: 1, items: map[int64]domain.Category{}}
}

func (repo *categoryRepositoryFake) seed(t *testing.T, name string, kind domain.Kind, isSystem bool, isActive bool) domain.Category {
	t.Helper()
	category, err := domain.NewCategory(repo.nextID, name, stringPtr("HelpCircle"), int(repo.nextID), kind, isSystem, isActive)
	if err != nil {
		t.Fatal(err)
	}
	repo.items[category.ID] = category
	repo.nextID++
	return category
}

func (repo *categoryRepositoryFake) List(_ context.Context, kind domain.Kind, includeInactive bool) ([]domain.Category, error) {
	var categories []domain.Category
	for _, category := range repo.items {
		if category.Kind != kind || (!includeInactive && !category.IsActive) {
			continue
		}
		categories = append(categories, category)
	}
	return categories, nil
}

func (repo *categoryRepositoryFake) Get(_ context.Context, id int64) (domain.Category, error) {
	category, ok := repo.items[id]
	if !ok {
		return domain.Category{}, domain.ErrNotFound
	}
	return category, nil
}

func (repo *categoryRepositoryFake) Create(_ context.Context, category domain.Category) (domain.Category, error) {
	category.ID = repo.nextID
	repo.nextID++
	repo.items[category.ID] = category
	return category, nil
}

func (repo *categoryRepositoryFake) Update(_ context.Context, category domain.Category) (domain.Category, error) {
	if _, ok := repo.items[category.ID]; !ok {
		return domain.Category{}, domain.ErrNotFound
	}
	repo.items[category.ID] = category
	return category, nil
}

func (repo *categoryRepositoryFake) Exists(_ context.Context, id int64, kind domain.Kind) (bool, error) {
	category, ok := repo.items[id]
	return ok && category.Kind == kind && category.IsActive, nil
}

func (repo *categoryRepositoryFake) NameExists(_ context.Context, name string, kind domain.Kind, exceptID *int64) (bool, error) {
	for _, category := range repo.items {
		if exceptID != nil && category.ID == *exceptID {
			continue
		}
		if category.Name == name && category.Kind == kind {
			return true, nil
		}
	}
	return false, nil
}

func (repo *categoryRepositoryFake) NextSortOrder(_ context.Context, kind domain.Kind) (int, error) {
	maxOrder := 0
	for _, category := range repo.items {
		if category.Kind == kind && category.SortOrder > maxOrder {
			maxOrder = category.SortOrder
		}
	}
	return maxOrder + 1, nil
}

func stringPtr(value string) *string {
	return &value
}
