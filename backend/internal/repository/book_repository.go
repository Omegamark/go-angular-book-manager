package repository

import (
	"context"

	"github.com/Omegamark/book-epub-manager-backend/internal/domain"
)

type BookRepository interface {
	Get(ctx context.Context) ([]domain.Book, error)
	Create(ctx context.Context, b *domain.Book) error
	Delete(ctx context.Context, id string) error
}
