package config

import (
	"os"
	"strings"
)

type Settings struct {
	Port        string
	DatabaseURL string
	CORSOrigins []string
	LogLevel    string
}

func Load() Settings {
	return Settings{
		Port:        env("PORT", "8000"),
		DatabaseURL: env("DATABASE_URL", "postgres://caudal:caudal@localhost:5432/caudal"),
		CORSOrigins: splitCSV(env("CORS_ORIGINS", "http://localhost:5173")),
		LogLevel:    env("LOG_LEVEL", "info"),
	}
}

func env(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			values = append(values, trimmed)
		}
	}
	return values
}
