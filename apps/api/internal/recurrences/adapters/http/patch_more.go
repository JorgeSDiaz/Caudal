package http

import (
	"encoding/json"
	"time"

	"caudal-api/internal/platform/httpx"
)

func setNullableInt(raw map[string]json.RawMessage, key string, target ***int) {
	value, ok := raw[key]
	if !ok {
		return
	}
	var parsed *int
	if string(value) != "null" {
		var number int
		_ = json.Unmarshal(value, &number)
		parsed = &number
	}
	*target = &parsed
}

func decodeOptional(raw map[string]json.RawMessage, key string, target any) bool {
	value, ok := raw[key]
	if !ok {
		return false
	}
	if err := json.Unmarshal(value, target); err != nil {
		panic(err)
	}
	return true
}

func parseOptionalDate(value *string) (*time.Time, error) {
	if value == nil {
		return nil, nil
	}
	parsed, err := httpx.ParseDate(*value)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}

func formatOptionalDate(value *time.Time) *string {
	if value == nil {
		return nil
	}
	formatted := httpx.FormatDate(*value)
	return &formatted
}
