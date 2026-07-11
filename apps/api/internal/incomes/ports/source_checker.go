package ports

import "context"

type SourceChecker interface {
	IncomeSourceExists(context.Context, int64) (bool, error)
}
