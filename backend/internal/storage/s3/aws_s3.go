package s3adapter

import (
	"context"
	"errors"
	"path"
	"time"

	"github.com/Omegamark/book-epub-manager-backend/internal/storage"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Storage struct {
	client    *s3.Client
	presigner *s3.PresignClient
	bucket    string
}

// New returns a configured S3Storage. It loads AWS config if awsCfg is nil.
func New(ctx context.Context, bucket string, awsCfg *aws.Config) (storage.Storage, error) {
	if bucket == "" {
		return nil, errors.New("bucket name here")
	}

	var cfg aws.Config
	var err error
	if awsCfg == nil {
		cfg, err = config.LoadDefaultConfig(ctx)
		if err != nil {
			return nil, err
		}
	} else {
		cfg = *awsCfg
	}
	client := s3.NewFromConfig(cfg)
	presigner := s3.NewPresignClient(client)
	return &S3Storage{client: client, presigner: presigner, bucket: bucket}, nil
}

func (s *S3Storage) ListEpubs(ctx context.Context, prefix string) ([]storage.EpubEntry, error) {
	paginator := s3.NewListObjectsV2Paginator(s.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(prefix),
	})

	var out []storage.EpubEntry
	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		for _, obj := range page.Contents {
			// Using path.Base to derive a filename or title from the key.
			title := path.Base(aws.ToString(obj.Key))
			out = append(out, storage.EpubEntry{
				Key:   aws.ToString(obj.Key),
				Title: title,
			})
		}
	}
	return out, nil
}

func (s *S3Storage) PresignGet(ctx context.Context, key string, expires time.Duration) (string, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}

	presigned, err := s.presigner.PresignGetObject(ctx, input, s3.WithPresignExpires(expires))
	if err != nil {
		return "", err
	}
	return presigned.URL, nil
}
