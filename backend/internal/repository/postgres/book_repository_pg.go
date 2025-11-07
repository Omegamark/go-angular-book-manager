package postgres

import (
	"context"
	"errors"

	"github.com/Omegamark/book-epub-manager-backend/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresBookRepo struct {
	pool *pgxpool.Pool
}

func NewPostgresBookRepo(pool *pgxpool.Pool) *PostgresBookRepo {
	return &PostgresBookRepo{pool: pool}
}

func (r *PostgresBookRepo) Get(ctx context.Context) ([]domain.Book, error) {
	const q = `SELECT id, title, author FROM books`
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []domain.Book
	for rows.Next() {
		var b domain.Book
		if err := rows.Scan(&b.ID, &b.Title, &b.Author); err != nil {
			return nil, err
		}
		books = append(books, b)
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return books, nil
}

func (r *PostgresBookRepo) Create(ctx context.Context, b *domain.Book) error {
	const q = `INSERT INTO books (id, title, author) VALUES ($1, $2, $3)`
	_, err := r.pool.Exec(ctx, q, b.ID, b.Title, b.Author)
	if err != nil {
		return err
	}
	return nil
}

func (r *PostgresBookRepo) Delete(ctx context.Context, id string) error {
	const q = `DELETE FROM books WHERE id = $1`
	cmd, err := r.pool.Exec(ctx, q, id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return errors.New("not found")
	}
	return nil
}
