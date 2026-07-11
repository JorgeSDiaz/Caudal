package http

import (
	"net/http"

	expenseapp "caudal-api/internal/expenses/application"
	expensedomain "caudal-api/internal/expenses/domain"
	incomeapp "caudal-api/internal/incomes/application"
	incomedomain "caudal-api/internal/incomes/domain"
	"caudal-api/internal/platform/httpx"
)

type Router struct {
	exportExpenses expenseapp.ExportExpenses
	importExpenses expenseapp.ImportExpenses
	exportIncomes  incomeapp.ExportIncomes
	importIncomes  incomeapp.ImportIncomes
}

func NewRouter(exportExpenses expenseapp.ExportExpenses, importExpenses expenseapp.ImportExpenses, exportIncomes incomeapp.ExportIncomes, importIncomes incomeapp.ImportIncomes) Router {
	return Router{
		exportExpenses: exportExpenses, importExpenses: importExpenses,
		exportIncomes: exportIncomes, importIncomes: importIncomes,
	}
}

func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/backup", router.exportBackup)
	mux.HandleFunc("POST /api/v1/backup", router.importBackup)
}

func (router Router) exportBackup(w http.ResponseWriter, r *http.Request) {
	expenses, err := router.exportExpenses.Execute(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	incomes, err := router.exportIncomes.Execute(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, BackupDocument{
		Expenses: expenseRequests(expenses),
		Incomes:  incomeRequests(incomes),
	})
}

func (router Router) importBackup(w http.ResponseWriter, r *http.Request) {
	var document BackupDocument
	if !httpx.Decode(w, r, &document) {
		return
	}
	expenseCommands, err := document.ExpenseCommands()
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	incomeCommands, err := document.IncomeCommands()
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	importedExpenses, err := router.importExpenses.Execute(r.Context(), expenseCommands)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	importedIncomes, err := router.importIncomes.Execute(r.Context(), incomeCommands)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]int{"imported": importedExpenses + importedIncomes})
}

func expenseRequests(items []expensedomain.Expense) []MovementRequest {
	requests := make([]MovementRequest, 0, len(items))
	for _, item := range items {
		requests = append(requests, MovementRequest{
			AmountCents: item.Money.AmountCents, Currency: item.Money.Currency,
			CategoryID: item.CategoryID, OccurredOn: httpx.FormatDate(item.OccurredOn),
			Note: item.Note,
		})
	}
	return requests
}

func incomeRequests(items []incomedomain.Income) []MovementRequest {
	requests := make([]MovementRequest, 0, len(items))
	for _, item := range items {
		requests = append(requests, MovementRequest{
			AmountCents: item.Money.AmountCents, Currency: item.Money.Currency,
			SourceID: item.SourceID, OccurredOn: httpx.FormatDate(item.OccurredOn),
			Note: item.Note,
		})
	}
	return requests
}
