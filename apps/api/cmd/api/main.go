package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"time"

	"caudal-api/internal/app"
	"caudal-api/internal/platform/config"
	"caudal-api/internal/platform/logging"
	"caudal-api/internal/platform/persistence"
)

func main() {
	settings := config.Load()
	logger := logging.New(settings.LogLevel)

	db, sqlDB, err := persistence.Open(settings.DatabaseURL, logger)
	if err != nil {
		logger.Error("open database", slog.Any("error", err))
		os.Exit(1)
	}
	defer sqlDB.Close()

	if err := persistence.Migrate(sqlDB, "db/migrations"); err != nil {
		logger.Error("migrate database", slog.Any("error", err))
		os.Exit(1)
	}

	server := &http.Server{
		Addr:              ":" + settings.Port,
		Handler:           app.NewRouter(db, settings, logger),
		ReadHeaderTimeout: 5 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	go shutdownOnSignal(ctx, server, logger)
	logger.Info("api listening", slog.String("addr", server.Addr))
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("listen", slog.Any("error", err))
		os.Exit(1)
	}
}

func shutdownOnSignal(ctx context.Context, server *http.Server, logger *slog.Logger) {
	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("shutdown", slog.Any("error", err))
	}
}
