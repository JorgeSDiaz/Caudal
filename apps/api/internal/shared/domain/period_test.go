package domain_test

import (
	"testing"
	"time"

	shared "caudal-api/internal/shared/domain"
	"github.com/stretchr/testify/require"
)

func TestFinancialMonthBounds(t *testing.T) {
	start, end := shared.FinancialMonthBounds(2026, time.July)

	require.Equal(t, shared.DateOnly(2026, time.June, 30), start)
	require.Equal(t, shared.DateOnly(2026, time.July, 30), end)
}

func TestFinancialMonthBoundsClampsFebruary(t *testing.T) {
	start, end := shared.FinancialMonthBounds(2026, time.March)

	require.Equal(t, shared.DateOnly(2026, time.February, 28), start)
	require.Equal(t, shared.DateOnly(2026, time.March, 30), end)
}
