package httptransport

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/Omegamark/book-epub-manager-backend/internal/domain"
	"github.com/Omegamark/book-epub-manager-backend/internal/service"
	"github.com/gorilla/mux"
)

type Handler struct {
	service *service.BookService
}

func NewHandler(s *service.BookService) *Handler {
	return &Handler{service: s}
}

func (h *Handler) RegisterRoutes(r *mux.Router) {
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/books", h.getBooks).Methods(http.MethodGet)
	api.HandleFunc("/books", h.createBook).Methods(http.MethodPost)
	api.HandleFunc("/books/{id}", h.deleteBook).Methods(http.MethodDelete)
}

func (h *Handler) getBooks(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Getting Books Sanity Check")
	ctx := r.Context()
	books, err := h.service.GetBooks(ctx)
	if err != nil {
		h.handleError(w, err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func (h *Handler) createBook(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Creating Book Sanity Check")
	ctx := r.Context()
	var b domain.Book
	err := json.NewDecoder(r.Body).Decode(&b)
	if err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	err = h.service.AddBook(ctx, &b)
	if err != nil {
		h.handleError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(b)
}

func (h *Handler) deleteBook(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Deleting Book Sanity Check")
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]
	err := h.service.RemoveBook(ctx, id)
	if err != nil {
		h.handleError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) handleError(w http.ResponseWriter, err error) {
	// map service errors to status codes
	var appErr *service.AppError
	if errors.As(err, &appErr) {
		http.Error(w, appErr.Message, appErr.Code)
		return
	}

	switch err.Error() {
	case "not found":
		http.Error(w, "not found", http.StatusNotFound)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}
