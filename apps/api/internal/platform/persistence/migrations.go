package persistence

import (
	"database/sql"

	"github.com/pressly/goose/v3"
)

func Migrate(db *sql.DB, directory string) error {
	goose.SetDialect("postgres")
	return goose.Up(db, directory)
}
