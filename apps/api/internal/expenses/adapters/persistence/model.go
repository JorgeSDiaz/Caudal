package persistence

import (
	"time"
)

type ExpenseModel struct {
	ID          int64      `gorm:"primaryKey;column:id"`
	AmountCents int64      `gorm:"column:amount_cents"`
	Currency    string     `gorm:"column:currency"`
	CategoryID  int64      `gorm:"column:category_id"`
	OccurredOn  time.Time  `gorm:"column:occurred_on"`
	Note        *string    `gorm:"column:note"`
	CreatedAt   time.Time  `gorm:"column:created_at"`
	UpdatedAt   time.Time  `gorm:"column:updated_at"`
	DeletedAt   *time.Time `gorm:"column:deleted_at"`
}

func (ExpenseModel) TableName() string {
	return "expense"
}
