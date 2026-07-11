package domain

import "errors"

type Kind string

const (
	ExpenseKind Kind = "expense"
	IncomeKind  Kind = "income"
)

type Category struct {
	ID        int64
	Name      string
	Icon      *string
	SortOrder int
	Kind      Kind
}

func ParseKind(value string) (Kind, error) {
	switch Kind(value) {
	case ExpenseKind, IncomeKind:
		return Kind(value), nil
	default:
		return "", errors.New("category kind must be expense or income")
	}
}
