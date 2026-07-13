package domain

import (
	"errors"
	"time"

	shared "caudal-api/internal/shared/domain"
)

var (
	ErrNotFound      = errors.New("income not found")
	ErrUnknownSource = errors.New("unknown income source")
)

type Income struct {
	ID         int64
	Money      shared.Money
	SourceID   int64
	OccurredOn time.Time
	Note       *string
}

func NewIncome(id int64, money shared.Money, sourceID int64, occurredOn time.Time, note *string) (Income, error) {
	if money.AmountCents <= 0 {
		return Income{}, errors.New("an income amount must be positive")
	}
	if sourceID <= 0 {
		return Income{}, errors.New("source_id must be positive")
	}
	return Income{
		ID: id, Money: money, SourceID: sourceID,
		OccurredOn: occurredOn, Note: note,
	}, nil
}
