package http

import (
	"errors"
	"net/http"

	"caudal-api/internal/expenses/application"
	"caudal-api/internal/expenses/domain"
	"caudal-api/internal/platform/httpx"
)

type Router struct {
	create application.CreateExpense
	list   application.ListExpenses
	update application.UpdateExpense
	delete application.DeleteExpense
}

func NewRouter(create application.CreateExpense, list application.ListExpenses, update application.UpdateExpense, delete application.DeleteExpense) Router {
	return Router{create: create, list: list, update: update, delete: delete}
}

func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/expenses", router.createExpense)
	mux.HandleFunc("GET /api/v1/expenses", router.listExpenses)
	mux.HandleFunc("PATCH /api/v1/expenses/{expense_id}", router.updateExpense)
	mux.HandleFunc("DELETE /api/v1/expenses/{expense_id}", router.deleteExpense)
}

func (router Router) createExpense(w http.ResponseWriter, r *http.Request) {
	var request ExpenseRequest
	if !httpx.Decode(w, r, &request) {
		return
	}
	command, err := request.Command()
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	expense, err := router.create.Execute(r.Context(), command)
	writeExpense(w, expense, err, http.StatusCreated)
}

func (router Router) listExpenses(w http.ResponseWriter, r *http.Request) {
	year, month, err := httpx.QueryMonth(r, "month")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	limit, err := httpx.QueryInt(r, "limit", 50, 1, 200)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	offset, err := httpx.QueryInt(r, "offset", 0, 0, 1_000_000)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	page, err := router.list.Execute(r.Context(), application.ListExpensesQuery{
		Year: year, Month: month, Limit: limit, Offset: offset,
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, expensePage(page.Items, page.Total))
}

func (router Router) updateExpense(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "expense_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	raw, ok := httpx.DecodeMap(w, r)
	if !ok {
		return
	}
	command, err := safePatchExpense(id, raw)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	expense, err := router.update.Execute(r.Context(), command)
	writeExpense(w, expense, err, http.StatusOK)
}

func (router Router) deleteExpense(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "expense_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	if err := router.delete.Execute(r.Context(), id); err != nil {
		writeExpense(w, domain.Expense{}, err, http.StatusNoContent)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeExpense(w http.ResponseWriter, expense domain.Expense, err error, status int) {
	switch {
	case err == nil:
		httpx.JSON(w, status, expenseResponse(expense))
	case errors.Is(err, domain.ErrNotFound):
		httpx.Error(w, http.StatusNotFound, err.Error())
	default:
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
	}
}
