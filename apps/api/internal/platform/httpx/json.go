package httpx

import (
	"encoding/json"
	"errors"
	"net/http"
)

type ErrorResponse struct {
	Detail string `json:"detail"`
}

func Decode(w http.ResponseWriter, r *http.Request, target any) bool {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		Error(w, http.StatusUnprocessableEntity, err.Error())
		return false
	}
	return true
}

func DecodeMap(w http.ResponseWriter, r *http.Request) (map[string]json.RawMessage, bool) {
	var raw map[string]json.RawMessage
	return raw, Decode(w, r, &raw)
}

func JSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if body != nil {
		_ = json.NewEncoder(w).Encode(body)
	}
}

func Error(w http.ResponseWriter, status int, message string) {
	if message == "" {
		message = http.StatusText(status)
	}
	JSON(w, status, ErrorResponse{Detail: message})
}

func DomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		Error(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrInvalid):
		Error(w, http.StatusUnprocessableEntity, err.Error())
	default:
		Error(w, http.StatusInternalServerError, err.Error())
	}
}
