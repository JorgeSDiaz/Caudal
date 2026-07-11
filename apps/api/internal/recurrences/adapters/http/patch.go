package http

import (
	"encoding/json"
	"time"

	"caudal-api/internal/platform/httpx"
	"caudal-api/internal/recurrences/domain"
)

func setInt64(raw map[string]json.RawMessage, key string, target **int64) {
	var value int64
	if decodeOptional(raw, key, &value) {
		*target = &value
	}
}

func setInt(raw map[string]json.RawMessage, key string, target **int) {
	var value int
	if decodeOptional(raw, key, &value) {
		*target = &value
	}
}

func setString(raw map[string]json.RawMessage, key string, target **string) {
	var value string
	if decodeOptional(raw, key, &value) {
		*target = &value
	}
}

func setBool(raw map[string]json.RawMessage, key string, target **bool) {
	var value bool
	if decodeOptional(raw, key, &value) {
		*target = &value
	}
}

func setFrequency(raw map[string]json.RawMessage, key string, target **domain.Frequency) {
	var value domain.Frequency
	if decodeOptional(raw, key, &value) {
		*target = &value
	}
}

func setDate(raw map[string]json.RawMessage, key string, target **time.Time) error {
	var text string
	if !decodeOptional(raw, key, &text) {
		return nil
	}
	value, err := httpx.ParseDate(text)
	if err != nil {
		return err
	}
	*target = &value
	return nil
}

func setNullableDate(raw map[string]json.RawMessage, key string, target ***time.Time) error {
	value, ok := raw[key]
	if !ok {
		return nil
	}
	var parsed *time.Time
	if string(value) != "null" {
		var text string
		if err := json.Unmarshal(value, &text); err != nil {
			return err
		}
		date, err := httpx.ParseDate(text)
		if err != nil {
			return err
		}
		parsed = &date
	}
	*target = &parsed
	return nil
}

func setNullableString(raw map[string]json.RawMessage, key string, target ***string) {
	value, ok := raw[key]
	if !ok {
		return
	}
	var parsed *string
	if string(value) != "null" {
		var text string
		_ = json.Unmarshal(value, &text)
		parsed = &text
	}
	*target = &parsed
}
