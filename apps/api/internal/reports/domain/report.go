package domain

type CategoryBreakdown struct {
	CategoryID   int64
	CategoryName string
	CategoryIcon *string
	TotalCents   int64
}

type SourceBreakdown struct {
	SourceID   int64
	SourceName string
	SourceIcon *string
	TotalCents int64
}

type MonthlyReport struct {
	Year                           int
	Month                          int
	ExpenseTotalCents              int64
	PreviousMonthExpenseTotalCents int64
	IncomeTotalCents               int64
	PreviousMonthIncomeTotalCents  int64
	NetCents                       int64
	ByCategory                     []CategoryBreakdown
	BySource                       []SourceBreakdown
}
