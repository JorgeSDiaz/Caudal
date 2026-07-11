package persistence

import "time"

type RecurrenceModel struct {
	ID               int64      `gorm:"primaryKey;column:id"`
	Kind             string     `gorm:"column:kind"`
	AmountCents      int64      `gorm:"column:amount_cents"`
	Currency         string     `gorm:"column:currency"`
	CategoryID       int64      `gorm:"column:category_id"`
	Frequency        string     `gorm:"column:frequency"`
	DayOfMonth       int        `gorm:"column:day_of_month"`
	SecondDayOfMonth *int       `gorm:"column:second_day_of_month"`
	StartDate        time.Time  `gorm:"column:start_date"`
	EndDate          *time.Time `gorm:"column:end_date"`
	Note             *string    `gorm:"column:note"`
	IsActive         bool       `gorm:"column:is_active"`
	LastGeneratedOn  *time.Time `gorm:"column:last_generated_on"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`
	DeletedAt        *time.Time `gorm:"column:deleted_at"`
}

func (RecurrenceModel) TableName() string {
	return "recurrence"
}
