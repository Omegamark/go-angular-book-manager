package storage

import (
	"context"
	"time"
)

type EpubEntry struct {
	Key   string `json:"key"`
	Title string `json:"title,omitempty"`
}

// Abstraction used by the handlers so AWS, GCP, etc could all implement
type Storage interface {
	// ListEpubs lists keys (optionally with a prefix). Returns entries
	ListEpubs(ctx context.Context, prefix string) ([]EpubEntry, error)

	// PresignGet returns a presigned GET URL for the given object key valid for expires.
	PresignGet(ctx context.Context, key string, expires time.Duration) (string, error)
}
