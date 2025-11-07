package service

import (
	"context"

	"github.com/Omegamark/book-epub-manager-backend/internal/domain"
	"github.com/Omegamark/book-epub-manager-backend/internal/repository"
)

type BookService struct {
	repo repository.BookRepository
}

func NewBookService(r repository.BookRepository) *BookService {
	return &BookService{repo: r}
}

// TODO: Get the books
func (s *BookService) GetBooks(ctx context.Context) ([]domain.Book, error) {
	return s.repo.Get(ctx)
}

func (s *BookService) AddBook(ctx context.Context, b *domain.Book) error {
	// some half done validations
	if b == nil || b.ID == "" || b.Author == "" {
		return ErrInvalidBook
	}
	return s.repo.Create(ctx, b)
}

func (s *BookService) RemoveBook(ctx context.Context, id string) error {
	if id == "" {
		return ErrInvalidID
	}
	return s.repo.Delete(ctx, id)
}

// application errors
var (
	ErrInvalidBook = &AppError{Message: "invalid book payload", Code: 400}
	ErrInvalidID   = &AppError{Message: "invalid id", Code: 400}
)

type AppError struct {
	Message string
	Code    int
}

func (e *AppError) Error() string { return e.Message }
