package http

import (
	"net/http"

	"caudal-api/internal/platform/httpx"
	"caudal-api/internal/reports/application"
	"caudal-api/internal/reports/domain"
)

type Router struct {
	monthly application.MonthlyReport
}

func NewRouter(monthly application.MonthlyReport) Router {
	return Router{monthly: monthly}
}

func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/reports/monthly", router.monthlyReport)
}

func (router Router) monthlyReport(w http.ResponseWriter, r *http.Request) {
	year, month, err := httpx.QueryMonth(r, "month")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	report, err := router.monthly.Execute(r.Context(), application.MonthlyReportQuery{Year: year, Month: month})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, monthlyResponse(report))
}

func monthlyResponse(report domain.MonthlyReport) MonthlyReportResponse {
	return MonthlyReportResponse{
		Year: report.Year, Month: report.Month,
		ExpenseTotalCents:              report.ExpenseTotalCents,
		PreviousMonthExpenseTotalCents: report.PreviousMonthExpenseTotalCents,
		IncomeTotalCents:               report.IncomeTotalCents,
		PreviousMonthIncomeTotalCents:  report.PreviousMonthIncomeTotalCents,
		NetCents:                       report.NetCents,
		ByCategory:                     categoryResponses(report.ByCategory),
		BySource:                       sourceResponses(report.BySource),
	}
}
