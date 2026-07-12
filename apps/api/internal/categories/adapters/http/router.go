package http

import (
	"errors"
	"net/http"

	"caudal-api/internal/categories/application"
	"caudal-api/internal/categories/domain"
	"caudal-api/internal/platform/httpx"
)

type Router struct {
	create application.CreateCategory
	list   application.ListCategories
	update application.UpdateCategory
	delete application.DeleteCategory
}

func NewRouter(create application.CreateCategory, list application.ListCategories, update application.UpdateCategory, delete application.DeleteCategory) Router {
	return Router{create: create, list: list, update: update, delete: delete}
}

func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/categories", router.listCategories)
	mux.HandleFunc("POST /api/v1/categories", router.createCategory)
	mux.HandleFunc("PATCH /api/v1/categories/{category_id}", router.updateCategory)
	mux.HandleFunc("DELETE /api/v1/categories/{category_id}", router.deleteCategory)
}

func (router Router) listCategories(w http.ResponseWriter, r *http.Request) {
	kind, err := domain.ParseKind(queryDefault(r, "kind", string(domain.ExpenseKind)))
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	categories, err := router.list.Execute(r.Context(), application.ListCategoriesQuery{
		Kind: kind, IncludeInactive: r.URL.Query().Get("include_inactive") == "true",
	})
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, categoryResponses(categories))
}

func (router Router) createCategory(w http.ResponseWriter, r *http.Request) {
	var request CategoryRequest
	if !httpx.Decode(w, r, &request) {
		return
	}
	kind, err := domain.ParseKind(string(request.Kind))
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	category, err := router.create.Execute(r.Context(), application.CreateCategoryCommand{
		Name: request.Name, Icon: request.Icon, Kind: kind,
	})
	writeCategory(w, category, err, http.StatusCreated)
}

func (router Router) updateCategory(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "category_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	raw, ok := httpx.DecodeMap(w, r)
	if !ok {
		return
	}
	command, err := safePatchCategory(id, raw)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	category, err := router.update.Execute(r.Context(), command)
	writeCategory(w, category, err, http.StatusOK)
}

func (router Router) deleteCategory(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.PathInt64(r, "category_id")
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	if err := router.delete.Execute(r.Context(), id); err != nil {
		writeCategory(w, domain.Category{}, err, http.StatusNoContent)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func queryDefault(r *http.Request, key string, fallback string) string {
	value := r.URL.Query().Get(key)
	if value == "" {
		return fallback
	}
	return value
}

func writeCategory(w http.ResponseWriter, category domain.Category, err error, status int) {
	switch {
	case err == nil:
		httpx.JSON(w, status, categoryResponse(category))
	case errors.Is(err, domain.ErrNotFound):
		httpx.Error(w, http.StatusNotFound, err.Error())
	default:
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
	}
}
