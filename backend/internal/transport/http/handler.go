package httptransport

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/Omegamark/book-epub-manager-backend/internal/domain"
	"github.com/Omegamark/book-epub-manager-backend/internal/service"
	"github.com/Omegamark/book-epub-manager-backend/internal/storage"
	"github.com/gorilla/mux"
)

type Handler struct {
	service *service.BookService
	storage storage.Storage
}

func NewHandler(s *service.BookService, st storage.Storage) *Handler {
	return &Handler{service: s, storage: st}
}

func (h *Handler) RegisterRoutes(r *mux.Router) {
	// Book Service Endpoints
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/books", h.getBooks).Methods(http.MethodGet)
	api.HandleFunc("/books", h.createBook).Methods(http.MethodPost)
	api.HandleFunc("/books/{id}", h.deleteBook).Methods(http.MethodDelete)

	// storage epub endpoints
	api.HandleFunc("/epubs", h.listEpubs).Methods(http.MethodGet)
	api.HandleFunc("/epubs/presign", h.presignEpub).Methods(http.MethodGet)
}

func (h *Handler) listEpubs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	prefix := r.URL.Query().Get("prefix")
	if prefix == "" {
		prefix = "books/"
	}

	fmt.Println("URL: ", r.URL.String())

	entries, err := h.storage.ListEpubs(ctx, prefix)
	if err != nil {
		fmt.Println("ERR 1: ", err)
		h.handleError(w, err)
		return
	}

	// CORS Header
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}

func (h *Handler) presignEpub(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "missing key param", http.StatusBadRequest)
		return
	}

	// 15 min expiration
	url, err := h.storage.PresignGet(ctx, key, 15*time.Minute)
	if err != nil {
		fmt.Println("Err 2: ", err)
		h.handleError(w, err)
		return
	}
	// CORS header
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"url": url})
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
