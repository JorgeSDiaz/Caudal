package ports

import (
	"context"
	"time"

	"caudal-api/internal/recurrences/domain"
)

type MovementWriter interface {
	Create(context.Context, domain.Kind, int64, string, int64, time.Time, *string) error
}
