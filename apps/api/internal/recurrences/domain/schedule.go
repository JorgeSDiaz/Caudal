package domain

import (
	"sort"
	"time"
)

func DueOccurrences(recurrence Recurrence, today time.Time) []time.Time {
	if !recurrence.IsActive {
		return nil
	}
	var occurrences []time.Time
	year, month := recurrence.StartDate.Year(), recurrence.StartDate.Month()
	for year < today.Year() || year == today.Year() && month <= today.Month() {
		for _, day := range recurrence.Days() {
			occurrence := clampDay(year, month, day)
			if beforeDate(occurrence, recurrence.StartDate) || afterDate(occurrence, today) {
				continue
			}
			if recurrence.EndDate != nil && afterDate(occurrence, *recurrence.EndDate) {
				continue
			}
			if recurrence.LastGeneratedOn != nil && !afterDate(occurrence, *recurrence.LastGeneratedOn) {
				continue
			}
			occurrences = append(occurrences, occurrence)
		}
		year, month = nextMonth(year, month)
	}
	sort.Slice(occurrences, func(i int, j int) bool { return occurrences[i].Before(occurrences[j]) })
	return occurrences
}

func NextOccurrence(recurrence Recurrence, today time.Time) *time.Time {
	if !recurrence.IsActive {
		return nil
	}
	year, month := today.Year(), today.Month()
	for range 24 {
		for _, day := range recurrence.Days() {
			occurrence := clampDay(year, month, day)
			if !afterDate(occurrence, today) || beforeDate(occurrence, recurrence.StartDate) {
				continue
			}
			if recurrence.EndDate != nil && afterDate(occurrence, *recurrence.EndDate) {
				return nil
			}
			return &occurrence
		}
		year, month = nextMonth(year, month)
	}
	return nil
}

func clampDay(year int, month time.Month, day int) time.Time {
	last := time.Date(year, month+1, 0, 0, 0, 0, 0, time.UTC).Day()
	if day > last {
		day = last
	}
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

func nextMonth(year int, month time.Month) (int, time.Month) {
	if month == time.December {
		return year + 1, time.January
	}
	return year, month + 1
}

func beforeDate(left time.Time, right time.Time) bool {
	return left.Before(right)
}

func afterDate(left time.Time, right time.Time) bool {
	return left.After(right)
}
