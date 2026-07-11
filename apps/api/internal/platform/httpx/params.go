package httpx

import (
	"errors"
	"net/http"
	"strconv"
	"time"
)

func PathInt64(r *http.Request, name string) (int64, error) {
	return strconv.ParseInt(r.PathValue(name), 10, 64)
}

func QueryInt(r *http.Request, name string, fallback int, min int, max int) (int, error) {
	raw := r.URL.Query().Get(name)
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, err
	}
	if value < min || value > max {
		return 0, errors.New(name + " is out of range")
	}
	return value, nil
}

func QueryMonth(r *http.Request, name string) (int, time.Month, error) {
	parsed, err := time.Parse("2006-01", r.URL.Query().Get(name))
	if err != nil {
		return 0, 0, err
	}
	return parsed.Year(), parsed.Month(), nil
}

func ParseDate(value string) (time.Time, error) {
	return time.Parse("2006-01-02", value)
}

func FormatDate(value time.Time) string {
	return value.Format("2006-01-02")
}
