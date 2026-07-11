package domain

import (
	"errors"
	"sort"
	"time"

	shared "caudal-api/internal/shared/domain"
)

type Kind string
type Frequency string

const (
	ExpenseKind Kind      = "expense"
	IncomeKind  Kind      = "income"
	Monthly     Frequency = "monthly"
	Biweekly    Frequency = "biweekly"
)

var (
	ErrNotFound        = errors.New("recurrence not found")
	ErrUnknownCategory = errors.New("unknown recurrence category")
)

type Recurrence struct {
	ID               int64
	Kind             Kind
	Money            shared.Money
	CategoryID       int64
	Frequency        Frequency
	DayOfMonth       int
	SecondDayOfMonth *int
	StartDate        time.Time
	EndDate          *time.Time
	Note             *string
	IsActive         bool
	LastGeneratedOn  *time.Time
}

func NewRecurrence(item Recurrence) (Recurrence, error) {
	if err := validate(item); err != nil {
		return Recurrence{}, err
	}
	return item, nil
}

func (item Recurrence) Days() []int {
	if item.SecondDayOfMonth == nil {
		return []int{item.DayOfMonth}
	}
	days := []int{item.DayOfMonth, *item.SecondDayOfMonth}
	sort.Ints(days)
	if days[0] == days[1] {
		return days[:1]
	}
	return days
}

func validate(item Recurrence) error {
	if item.Kind != ExpenseKind && item.Kind != IncomeKind {
		return errors.New("kind must be expense or income")
	}
	if item.Money.AmountCents <= 0 {
		return errors.New("a recurrence amount must be positive")
	}
	if item.CategoryID <= 0 {
		return errors.New("category_id must be positive")
	}
	if item.DayOfMonth < 1 || item.DayOfMonth > 31 {
		return errors.New("day_of_month must be between 1 and 31")
	}
	return validateFrequency(item)
}

func validateFrequency(item Recurrence) error {
	if item.Frequency == Biweekly {
		if item.SecondDayOfMonth == nil {
			return errors.New("a biweekly recurrence needs a second day")
		}
		if *item.SecondDayOfMonth < 1 || *item.SecondDayOfMonth > 31 {
			return errors.New("second_day_of_month must be between 1 and 31")
		}
		if *item.SecondDayOfMonth == item.DayOfMonth {
			return errors.New("the two days of a biweekly recurrence must differ")
		}
	} else if item.Frequency == Monthly {
		if item.SecondDayOfMonth != nil {
			return errors.New("a monthly recurrence has only one day")
		}
	} else {
		return errors.New("frequency must be monthly or biweekly")
	}
	if item.EndDate != nil && item.EndDate.Before(item.StartDate) {
		return errors.New("end_date cannot be before start_date")
	}
	return nil
}
