package ports

import (
	"context"

	"caudal-api/internal/recurrences/domain"
)

type CategoryChecker interface {
	RecurrenceCategoryExists(context.Context, domain.Kind, int64) (bool, error)
}
