package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"caudal-api/internal/incomes/application"
	"caudal-api/internal/incomes/domain"
	"caudal-api/internal/platform/httpx"
)

type Router struct {
	create application.CreateIncome
	list   application.ListIncomes
	update application.UpdateIncome
	delete application.DeleteIncome
}

func NewRouter(create application.CreateIncome, list application.ListIncomes, update application.UpdateIncome, delete application.DeleteIncome) Router {
	return Router{create: create, list: list, update: update, delete: delete}
}

func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/incomes", router.createIncome)
	mux.HandleFunc("GET /api/v1/incomes", router.listIncomes)
	mux.HandleFunc("PATCH /api/v1/incomes/{income_id}", router.updateIncome)
	mux.HandleFunc("DELETE /api/v1/incomes/{income_id}", router.deleteIncome)
}

func (router Router) createIncome(w http.ResponseWriter, r *http.Request) {
	var request IncomeRequest
	if !httpx.Decode(w, r, &request) {
		return
	}
	command, err := request.Command()
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	income, err := router.create.Execute(r.Context(), command)
	writeIncome(w, income, err, http.StatusCreated)
}

func (router Router) listIncomes(w http.ResponseWriter, r *http.Request) {
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
	page, err := router.list.Execute(r.Context(), application.ListIncomesQuery{
		Year: year, Month: month, Limit: limit, Offset: offset,
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, incomePage(page.Items, page.Total))
}

func (router Router) updateIncome(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "income_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	raw, ok := httpx.DecodeMap(w, r)
	if !ok {
		return
	}
	command, err := safePatchIncome(id, raw)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	income, err := router.update.Execute(r.Context(), command)
	writeIncome(w, income, err, http.StatusOK)
}

func (router Router) deleteIncome(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "income_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	if err := router.delete.Execute(r.Context(), id); err != nil {
		writeIncome(w, domain.Income{}, err, http.StatusNoContent)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func safePatchIncome(id int64, raw map[string]json.RawMessage) (command application.UpdateIncomeCommand, err error) {
	defer func() {
		if recovered := recover(); recovered != nil {
			err = fmt.Errorf("%v", recovered)
		}
	}()
	return patchIncomeCommand(id, raw)
}

func writeIncome(w http.ResponseWriter, income domain.Income, err error, status int) {
	switch {
	case err == nil:
		httpx.JSON(w, status, incomeResponse(income))
	case errors.Is(err, domain.ErrNotFound):
		httpx.Error(w, http.StatusNotFound, err.Error())
	default:
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
	}
}
