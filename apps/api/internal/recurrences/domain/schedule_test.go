package domain_test

import (
	"testing"
	"time"

	"caudal-api/internal/recurrences/domain"
	shared "caudal-api/internal/shared/domain"
	"github.com/stretchr/testify/require"
)

func TestDueOccurrencesIsBoundedByLastGenerated(t *testing.T) {
	secondDay := 30
	lastGenerated := date(2026, time.January, 15)
	recurrence := recurrence(t, domain.Biweekly, 15, &secondDay)
	recurrence.LastGeneratedOn = &lastGenerated

	occurrences := domain.DueOccurrences(recurrence, date(2026, time.February, 1))

	require.Equal(t, []time.Time{
		date(2026, time.January, 30),
	}, occurrences)
}

func TestNextOccurrenceClampsDayToMonthEnd(t *testing.T) {
	recurrence := recurrence(t, domain.Monthly, 31, nil)

	next := domain.NextOccurrence(recurrence, date(2026, time.February, 1))

	require.NotNil(t, next)
	require.Equal(t, date(2026, time.February, 28), *next)
}

func recurrence(t *testing.T, frequency domain.Frequency, day int, secondDay *int) domain.Recurrence {
	t.Helper()
	money, err := shared.NewMoney(1000, "COP")
	require.NoError(t, err)
	item, err := domain.NewRecurrence(domain.Recurrence{
		Kind: domain.ExpenseKind, Money: money, CategoryID: 1,
		Frequency: frequency, DayOfMonth: day, SecondDayOfMonth: secondDay,
		StartDate: date(2026, time.January, 1), IsActive: true,
	})
	require.NoError(t, err)
	return item
}

func date(year int, month time.Month, day int) time.Time {
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}
