package http

import (
	"net/http"

	"caudal-api/internal/categories/application"
	"caudal-api/internal/categories/domain"
	"caudal-api/internal/platform/httpx"
)

type Router struct {
	list application.ListCategories
}

func NewRouter(list application.ListCategories) Router {
	return Router{list: list}
}

func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/categories", router.listCategories)
}

func (router Router) listCategories(w http.ResponseWriter, r *http.Request) {
	kind, err := domain.ParseKind(queryDefault(r, "kind", string(domain.ExpenseKind)))
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	categories, err := router.list.Execute(r.Context(), kind)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, categoryResponses(categories))
}

func queryDefault(r *http.Request, key string, fallback string) string {
	value := r.URL.Query().Get(key)
	if value == "" {
		return fallback
	}
	return value
}
