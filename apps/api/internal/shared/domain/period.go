package domain

import "time"

const PeriodBoundaryDay = 30

func FinancialMonthBounds(year int, month time.Month) (time.Time, time.Time) {
	previousYear, previousMonth := PreviousFinancialMonth(year, month)
	return boundary(previousYear, previousMonth), boundary(year, month)
}

func PreviousFinancialMonth(year int, month time.Month) (int, time.Month) {
	if month == time.January {
		return year - 1, time.December
	}
	return year, month - 1
}

func boundary(year int, month time.Month) time.Time {
	return DateOnly(year, month, min(PeriodBoundaryDay, daysInMonth(year, month)))
}

func daysInMonth(year int, month time.Month) int {
	return time.Date(year, month+1, 0, 0, 0, 0, 0, time.UTC).Day()
}

func DateOnly(year int, month time.Month, day int) time.Time {
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}
