package persistence

import (
	"database/sql/driver"
	"encoding/json"
	"github.com/jackc/pgx/v5/pgtype"
	"time"
)

type ProfileModel struct {
	ID                       int16           `gorm:"primaryKey;column:id"`
	Alias                    *string         `gorm:"column:alias"`
	BirthYear                *int            `gorm:"column:birth_year"`
	City                     *string         `gorm:"column:city"`
	CountryCode              *string         `gorm:"column:country_code"`
	EstimatedMonthlyIncome   *int64          `gorm:"column:estimated_monthly_income"`
	EstimatedMonthlyExpenses *int64          `gorm:"column:estimated_monthly_expenses"`
	IncomeType               *string         `gorm:"column:income_type"`
	DependentsCount          *int            `gorm:"column:dependents_count"`
	Housing                  *string         `gorm:"column:housing"`
	RiskTolerance            *string         `gorm:"column:risk_tolerance"`
	Concerns                 StringArray     `gorm:"column:concerns;type:text[]"`
	Goals                    json.RawMessage `gorm:"column:goals;type:jsonb"`
	Metadata                 json.RawMessage `gorm:"column:metadata;type:jsonb"`
	CreatedAt                time.Time       `gorm:"column:created_at"`
	UpdatedAt                time.Time       `gorm:"column:updated_at"`
}

func (ProfileModel) TableName() string { return "profile" }

type StringArray []string

func (array *StringArray) Scan(source any) error {
	var decoded pgtype.FlatArray[string]
	if err := pgtype.NewMap().SQLScanner(&decoded).Scan(source); err != nil {
		return err
	}
	*array = StringArray(decoded)
	return nil
}

func (array StringArray) Value() (driver.Value, error) {
	encoded, err := pgtype.NewMap().Encode(pgtype.TextArrayOID, pgtype.TextFormatCode, pgtype.FlatArray[string](array), nil)
	if err != nil {
		return nil, err
	}
	return encoded, nil
}
