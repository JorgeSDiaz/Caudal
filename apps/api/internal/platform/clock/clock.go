package clock

import "time"

type Clock interface {
	Today() time.Time
	Now() time.Time
}

type SystemClock struct{}

func (SystemClock) Today() time.Time {
	now := time.Now()
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
}

func (SystemClock) Now() time.Time {
	return time.Now().UTC()
}
