package httpx

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCORSAllowsPutPreflight(t *testing.T) {
	handler := CORS([]string{"http://localhost:5173"}, http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("preflight should not reach the application handler")
	}))
	request := httptest.NewRequest(http.MethodOptions, "/api/v1/profile", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	request.Header.Set("Access-Control-Request-Method", http.MethodPut)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Header().Get("Access-Control-Allow-Methods"), http.MethodPut) {
		t.Fatalf("expected PUT in allowed methods, got %q", recorder.Header().Get("Access-Control-Allow-Methods"))
	}
}
