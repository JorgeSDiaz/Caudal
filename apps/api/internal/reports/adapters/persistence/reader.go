package persistence

import (
	"context"
	"time"

	"caudal-api/internal/reports/domain"
	shared "caudal-api/internal/shared/domain"
	"gorm.io/gorm"
)

type ExpenseReader struct {
	db *gorm.DB
}

type IncomeReader struct {
	db *gorm.DB
}

func NewExpenseReader(db *gorm.DB) ExpenseReader {
	return ExpenseReader{db: db}
}

func NewIncomeReader(db *gorm.DB) IncomeReader {
	return IncomeReader{db: db}
}

func (reader ExpenseReader) TotalForMonth(ctx context.Context, year int, month int) (int64, error) {
	var total int64
	start, end := bounds(year, month)
	err := reader.db.WithContext(ctx).Table("expense").
		Select("coalesce(sum(amount_cents), 0)").
		Where("deleted_at IS NULL AND occurred_on >= ? AND occurred_on < ?", start, end).
		Scan(&total).Error
	return total, err
}

func (reader ExpenseReader) BreakdownForMonth(ctx context.Context, year int, month int) ([]domain.CategoryBreakdown, error) {
	var rows []struct {
		CategoryID   int64
		CategoryName string
		TotalCents   int64
	}
	start, end := bounds(year, month)
	err := reader.db.WithContext(ctx).Table("category").
		Select("category.id AS category_id, category.name AS category_name, coalesce(sum(expense.amount_cents), 0) AS total_cents").
		Joins("JOIN expense ON expense.category_id = category.id").
		Where("expense.deleted_at IS NULL AND expense.occurred_on >= ? AND expense.occurred_on < ?", start, end).
		Group("category.id, category.name").Order("total_cents DESC").Scan(&rows).Error
	return categoryRows(rows), err
}

func (reader IncomeReader) TotalForMonth(ctx context.Context, year int, month int) (int64, error) {
	var total int64
	start, end := bounds(year, month)
	err := reader.db.WithContext(ctx).Table("income").
		Select("coalesce(sum(amount_cents), 0)").
		Where("deleted_at IS NULL AND occurred_on >= ? AND occurred_on < ?", start, end).
		Scan(&total).Error
	return total, err
}

func (reader IncomeReader) BreakdownForMonth(ctx context.Context, year int, month int) ([]domain.SourceBreakdown, error) {
	var rows []struct {
		SourceID   int64
		SourceName string
		TotalCents int64
	}
	start, end := bounds(year, month)
	err := reader.db.WithContext(ctx).Table("category").
		Select("category.id AS source_id, category.name AS source_name, coalesce(sum(income.amount_cents), 0) AS total_cents").
		Joins("JOIN income ON income.source_id = category.id").
		Where("income.deleted_at IS NULL AND income.occurred_on >= ? AND income.occurred_on < ?", start, end).
		Group("category.id, category.name").Order("total_cents DESC").Scan(&rows).Error
	return sourceRows(rows), err
}

func bounds(year int, month int) (time.Time, time.Time) {
	return shared.FinancialMonthBounds(year, time.Month(month))
}

func categoryRows(rows []struct {
	CategoryID   int64
	CategoryName string
	TotalCents   int64
}) []domain.CategoryBreakdown {
	items := make([]domain.CategoryBreakdown, 0, len(rows))
	for _, row := range rows {
		items = append(items, domain.CategoryBreakdown(row))
	}
	return items
}

func sourceRows(rows []struct {
	SourceID   int64
	SourceName string
	TotalCents int64
}) []domain.SourceBreakdown {
	items := make([]domain.SourceBreakdown, 0, len(rows))
	for _, row := range rows {
		items = append(items, domain.SourceBreakdown(row))
	}
	return items
}
