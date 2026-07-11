package domain

import (
	"errors"
	"strings"
	"unicode"
)

type Money struct {
	AmountCents int64
	Currency    string
}

func NewMoney(amountCents int64, currency string) (Money, error) {
	currency = strings.ToUpper(strings.TrimSpace(currency))
	if amountCents < 0 {
		return Money{}, errors.New("amount_cents cannot be negative")
	}
	if len(currency) != 3 {
		return Money{}, errors.New("currency must be a 3-letter ISO 4217 code")
	}
	for _, char := range currency {
		if !unicode.IsLetter(char) {
			return Money{}, errors.New("currency must be a 3-letter ISO 4217 code")
		}
	}
	return Money{AmountCents: amountCents, Currency: currency}, nil
}
