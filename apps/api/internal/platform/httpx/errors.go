package httpx

import "errors"

var (
	ErrInvalid  = errors.New("invalid request")
	ErrNotFound = errors.New("not found")
)
