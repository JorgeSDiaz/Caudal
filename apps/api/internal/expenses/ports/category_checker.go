package ports

import "context"

type CategoryChecker interface {
	ExpenseCategoryExists(context.Context, int64) (bool, error)
}
