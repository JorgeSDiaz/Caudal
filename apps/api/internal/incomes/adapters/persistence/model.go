package persistence

import "time"

type IncomeModel struct {
	ID          int64      `gorm:"primaryKey;column:id"`
	AmountCents int64      `gorm:"column:amount_cents"`
	Currency    string     `gorm:"column:currency"`
	SourceID    int64      `gorm:"column:source_id"`
	OccurredOn  time.Time  `gorm:"column:occurred_on"`
	Note        *string    `gorm:"column:note"`
	CreatedAt   time.Time  `gorm:"column:created_at"`
	UpdatedAt   time.Time  `gorm:"column:updated_at"`
	DeletedAt   *time.Time `gorm:"column:deleted_at"`
}

func (IncomeModel) TableName() string {
	return "income"
}
