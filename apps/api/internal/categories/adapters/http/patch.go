package http

import (
	"encoding/json"
	"fmt"

	"caudal-api/internal/categories/application"
)

func safePatchCategory(id int64, raw map[string]json.RawMessage) (command application.UpdateCategoryCommand, err error) {
	defer func() {
		if recovered := recover(); recovered != nil {
			err = fmt.Errorf("%v", recovered)
		}
	}()
	command.ID = id
	if err := setString(raw, "name", &command.Name); err != nil {
		return command, err
	}
	if err := setNullableString(raw, "icon", &command.Icon); err != nil {
		return command, err
	}
	if err := setBool(raw, "is_active", &command.IsActive); err != nil {
		return command, err
	}
	return command, nil
}

func setString(raw map[string]json.RawMessage, key string, target **string) error {
	var value string
	if !decodeOptional(raw, key, &value) {
		return nil
	}
	*target = &value
	return nil
}

func setBool(raw map[string]json.RawMessage, key string, target **bool) error {
	var value bool
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
