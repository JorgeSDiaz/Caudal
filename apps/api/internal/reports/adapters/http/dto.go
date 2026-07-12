package http

import "caudal-api/internal/reports/domain"

type CategoryBreakdownResponse struct {
	CategoryID   int64   `json:"category_id"`
	CategoryName string  `json:"category_name"`
	CategoryIcon *string `json:"category_icon"`
	TotalCents   int64   `json:"total_cents"`
}

type SourceBreakdownResponse struct {
	SourceID   int64   `json:"source_id"`
	SourceName string  `json:"source_name"`
	SourceIcon *string `json:"source_icon"`
	TotalCents int64   `json:"total_cents"`
}

type MonthlyReportResponse struct {
	Year                           int                         `json:"year"`
	Month                          int                         `json:"month"`
	ExpenseTotalCents              int64                       `json:"expense_total_cents"`
	PreviousMonthExpenseTotalCents int64                       `json:"previous_month_expense_total_cents"`
	IncomeTotalCents               int64                       `json:"income_total_cents"`
	PreviousMonthIncomeTotalCents  int64                       `json:"previous_month_income_total_cents"`
	NetCents                       int64                       `json:"net_cents"`
	ByCategory                     []CategoryBreakdownResponse `json:"by_category"`
	BySource                       []SourceBreakdownResponse   `json:"by_source"`
}

func categoryResponses(items []domain.CategoryBreakdown) []CategoryBreakdownResponse {
	response := make([]CategoryBreakdownResponse, 0, len(items))
	for _, item := range items {
		response = append(response, CategoryBreakdownResponse{
			CategoryID: item.CategoryID, CategoryName: item.CategoryName, CategoryIcon: item.CategoryIcon, TotalCents: item.TotalCents,
		})
	}
	return response
}

func sourceResponses(items []domain.SourceBreakdown) []SourceBreakdownResponse {
	response := make([]SourceBreakdownResponse, 0, len(items))
	for _, item := range items {
		response = append(response, SourceBreakdownResponse{
			SourceID: item.SourceID, SourceName: item.SourceName, SourceIcon: item.SourceIcon, TotalCents: item.TotalCents,
		})
	}
	return response
}
