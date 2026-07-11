package application_test

import (
	"context"
	"testing"
	"time"

	"caudal-api/internal/expenses/application"
	"caudal-api/internal/expenses/domain"
	"caudal-api/internal/expenses/ports"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestCreateExpenseUsesPorts(t *testing.T) {
	ctx := context.Background()
	repository := new(expenseRepositoryMock)
	checker := new(categoryCheckerMock)
	checker.On("ExpenseCategoryExists", ctx, int64(1)).Return(true, nil)
	repository.On("Create", ctx, mock.Anything).Return(func(_ context.Context, expense domain.Expense) domain.Expense {
		expense.ID = 10
		return expense
	}, nil)

	result, err := application.NewCreateExpense(repository, checker).Execute(ctx, application.CreateExpenseCommand{
		AmountCents: 1200, Currency: "cop", CategoryID: 1,
		OccurredOn: time.Date(2026, time.July, 10, 0, 0, 0, 0, time.UTC),
	})

	require.NoError(t, err)
	require.Equal(t, int64(10), result.ID)
	require.Equal(t, "COP", result.Money.Currency)
	repository.AssertExpectations(t)
	checker.AssertExpectations(t)
}

type expenseRepositoryMock struct {
	mock.Mock
}

func (mockRepo *expenseRepositoryMock) Create(ctx context.Context, expense domain.Expense) (domain.Expense, error) {
	args := mockRepo.Called(ctx, expense)
	return args.Get(0).(func(context.Context, domain.Expense) domain.Expense)(ctx, expense), args.Error(1)
}

func (mockRepo *expenseRepositoryMock) Get(context.Context, int64) (domain.Expense, error) {
	return domain.Expense{}, nil
}

func (mockRepo *expenseRepositoryMock) List(context.Context, time.Time, time.Time, int, int) (ports.Page, error) {
	return ports.Page{}, nil
}

func (mockRepo *expenseRepositoryMock) ListAll(context.Context) ([]domain.Expense, error) {
	return nil, nil
}

func (mockRepo *expenseRepositoryMock) Update(context.Context, domain.Expense) (domain.Expense, error) {
	return domain.Expense{}, nil
}

func (mockRepo *expenseRepositoryMock) Delete(context.Context, int64) error {
	return nil
}

type categoryCheckerMock struct {
	mock.Mock
}

func (checker *categoryCheckerMock) ExpenseCategoryExists(ctx context.Context, id int64) (bool, error) {
	args := checker.Called(ctx, id)
	return args.Bool(0), args.Error(1)
}
