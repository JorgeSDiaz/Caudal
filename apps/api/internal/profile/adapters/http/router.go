package http

import (
	"caudal-api/internal/platform/httpx"
	"caudal-api/internal/profile/application"
	"net/http"
)

type Router struct {
	get    application.GetProfile
	update application.UpdateProfile
}

func NewRouter(get application.GetProfile, update application.UpdateProfile) Router {
	return Router{get: get, update: update}
}
func (router Router) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/profile", router.getProfile)
	mux.HandleFunc("PUT /api/v1/profile", router.updateProfile)
}
func (router Router) getProfile(w http.ResponseWriter, r *http.Request) {
	profile, err := router.get.Execute(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, profileResponse(profile))
}
func (router Router) updateProfile(w http.ResponseWriter, r *http.Request) {
	raw, ok := httpx.DecodeMap(w, r)
	if !ok {
		return
	}
	command, err := updateCommand(raw)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	profile, err := router.update.Execute(r.Context(), command)
	if err != nil {
		httpx.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, profileResponse(profile))
}
