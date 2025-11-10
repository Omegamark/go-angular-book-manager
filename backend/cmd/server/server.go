package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/Omegamark/book-epub-manager-backend/internal/repository/postgres"
	"github.com/Omegamark/book-epub-manager-backend/internal/service"
	s3adapter "github.com/Omegamark/book-epub-manager-backend/internal/storage/s3"
	httptransport "github.com/Omegamark/book-epub-manager-backend/internal/transport/http"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"
)

func Run() {
	// TODO: This run function is a mess, needs to be broken out and cleaned up.
	// Use DATABASE_URL if set, otherwise connect to the docker container on localhost
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:5432/storepractice?sslmode=disable"
	}

	ctx := context.Background()

	// retry connect a few times (docker container may still be starting)
	// TODO: This retry logic should really be moved out of this file.
	var pool *pgxpool.Pool
	var err error

	for i := 0; i < 10; i++ {
		pool, err = pgxpool.New(ctx, dsn)
		if err == nil {
			// ping to ensure connection usable
			if pingErr := pool.Ping(ctx); pingErr == nil {
				break
			} else {
				pool.Close()
				err = pingErr
			}
		}

		log.Printf("db connect attempt %d failed: %v - retrying...", i+1, err)
		time.Sleep(1 * time.Second)

	}
	if err != nil {
		log.Fatalf("unable to connect to db: %v", err)
	}
	defer pool.Close()

	// Initialize S3 Storage
	// TODO: Need to break this out to the k8s manifests once the backend is working.
	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		bucket = "epubs-demo-bucket"
	}
	prefix := os.Getenv("S3_PREFIX")
	if prefix == "" {
		prefix = "books/"
	}

	region := "ap-southeast-2"
	accessKey := "Add your aws access key"
	secretKey := "Add your aws secret key"

	awsCfg := aws.Config{
		Region:      region,
		Credentials: credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
	}

	s3Storage, err := s3adapter.New(ctx, bucket, &awsCfg)
	if err != nil {
		log.Fatalf("S3 init failed: %v", err)
	}

	repo := postgres.NewPostgresBookRepo(pool)
	bookSvc := service.NewBookService(repo)
	handler := httptransport.NewHandler(bookSvc, s3Storage)

	r := mux.NewRouter()
	handler.RegisterRoutes(r)

	// CORS stuff to allow requests from frontend dev server (adjust origin as needed)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200"},
		AllowedMethods:   []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      c.Handler(r),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	// start server
	go func() {
		log.Printf("server listening %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	// gracefult shutdown on SIGINT/SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("shutting down server...")
	ctxShut, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctxShut); err != nil {
		log.Fatalf("server shutdown failed: %+v", err)
	}
}
