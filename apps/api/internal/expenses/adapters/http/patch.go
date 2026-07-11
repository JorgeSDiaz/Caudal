package http

import "encoding/json"

func setInt64(raw map[string]json.RawMessage, key string, target **int64) error {
	var value int64
	if !decodeOptional(raw, key, &value) {
		return nil
	}
	*target = &value
	return nil
}

func setString(raw map[string]json.RawMessage, key string, target **string) error {
	var value string
	if !decodeOptional(raw, key, &value) {
		return nil
	}
	*target = &value
	return nil
}

func setNullableString(raw map[string]json.RawMessage, key string, target ***string) error {
	value, ok := raw[key]
	if !ok {
		return nil
	}
	var parsed *string
	if string(value) != "null" {
		var text string
		if err := json.Unmarshal(value, &text); err != nil {
			return err
		}
		parsed = &text
	}
	*target = &parsed
	return nil
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
