package ports

import (
	"context"
	"time"

	"caudal-api/internal/recurrences/domain"
)

type MovementWriter interface {
	Create(context.Context, domain.Recurrence, time.Time) error
}
