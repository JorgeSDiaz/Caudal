package domain_test

import (
	"testing"

	shared "caudal-api/internal/shared/domain"
	"github.com/stretchr/testify/require"
)

func TestNewMoneyNormalizesCurrency(t *testing.T) {
	money, err := shared.NewMoney(1200, "cop")

	require.NoError(t, err)
	require.Equal(t, int64(1200), money.AmountCents)
	require.Equal(t, "COP", money.Currency)
}

func TestNewMoneyRejectsInvalidCurrency(t *testing.T) {
	_, err := shared.NewMoney(1200, "CO")

	require.Error(t, err)
}
