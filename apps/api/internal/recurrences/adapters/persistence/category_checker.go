package persistence

import (
	"context"

	"caudal-api/internal/recurrences/domain"
	"gorm.io/gorm"
)

type CategoryChecker struct {
	db *gorm.DB
}

func NewCategoryChecker(db *gorm.DB) CategoryChecker {
	return CategoryChecker{db: db}
}

func (checker CategoryChecker) RecurrenceCategoryExists(ctx context.Context, kind domain.Kind, id int64) (bool, error) {
	categoryKind := "expense"
	if kind == domain.IncomeKind {
		categoryKind = "income"
	}
	var count int64
	err := checker.db.WithContext(ctx).Table("category").
		Where("id = ? AND kind = ? AND is_active = ?", id, categoryKind, true).
		Count(&count).Error
	return count > 0, err
}
