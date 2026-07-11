package http

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"caudal-api/internal/platform/clock"
	"caudal-api/internal/platform/httpx"
	"caudal-api/internal/recurrences/application"
	"caudal-api/internal/recurrences/domain"
)

type Router struct {
	create application.CreateRecurrence
	list   application.ListRecurrences
	update application.UpdateRecurrence
	delete application.DeleteRecurrence
	run    application.RunDueRecurrences
	clock  clock.Clock
}

func NewRouter(create application.CreateRecurrence, list application.ListRecurrences, update application.UpdateRecurrence, delete application.DeleteRecurrence, run application.RunDueRecurrences, clock clock.Clock) Router {
	return Router{create: create, list: list, update: update, delete: delete, run: run, clock: clock}
}

func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/recurrences", router.createRecurrence)
	mux.HandleFunc("GET /api/v1/recurrences", router.listRecurrences)
	mux.HandleFunc("PATCH /api/v1/recurrences/{recurrence_id}", router.updateRecurrence)
	mux.HandleFunc("DELETE /api/v1/recurrences/{recurrence_id}", router.deleteRecurrence)
	mux.HandleFunc("POST /api/v1/recurrences/run", router.runRecurrences)
}

func (router Router) createRecurrence(w http.ResponseWriter, r *http.Request) {
	var request RecurrenceRequest
	if !httpx.Decode(w, r, &request) {
		return
	}
	command, err := request.Command()
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	item, err := router.create.Execute(r.Context(), command)
	writeRecurrence(w, item, err, http.StatusCreated, router.clock.Today())
}

func (router Router) listRecurrences(w http.ResponseWriter, r *http.Request) {
	kind, err := parseKindFilter(r)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	items, err := router.list.Execute(r.Context(), kind)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, recurrenceResponses(items, router.clock.Today()))
}

func (router Router) updateRecurrence(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "recurrence_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	raw, ok := httpx.DecodeMap(w, r)
	if !ok {
		return
	}
	command, err := safePatchRecurrence(id, raw)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	item, err := router.update.Execute(r.Context(), command)
	writeRecurrence(w, item, err, http.StatusOK, router.clock.Today())
}

func (router Router) deleteRecurrence(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "recurrence_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	if err := router.delete.Execute(r.Context(), id); err != nil {
		writeRecurrence(w, domain.Recurrence{}, err, http.StatusNoContent, router.clock.Today())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (router Router) runRecurrences(w http.ResponseWriter, r *http.Request) {
	generated, err := router.run.Execute(r.Context(), router.clock.Today())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]int{"generated": generated})
}

func parseKindFilter(r *http.Request) (*domain.Kind, error) {
	value := r.URL.Query().Get("kind")
	if value == "" {
		return nil, nil
	}
	kind := domain.Kind(value)
	if kind != domain.ExpenseKind && kind != domain.IncomeKind {
		return nil, errors.New("kind must be expense or income")
	}
	return &kind, nil
}

func safePatchRecurrence(id int64, raw map[string]json.RawMessage) (command application.UpdateRecurrenceCommand, err error) {
	defer func() {
		if recovered := recover(); recovered != nil {
			err = fmt.Errorf("%v", recovered)
		}
	}()
	return patchRecurrenceCommand(id, raw)
}

func writeRecurrence(w http.ResponseWriter, item domain.Recurrence, err error, status int, today time.Time) {
	switch {
	case err == nil:
		httpx.JSON(w, status, recurrenceResponse(item, today))
	case errors.Is(err, domain.ErrNotFound):
		httpx.Error(w, http.StatusNotFound, err.Error())
	default:
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
	}
}
