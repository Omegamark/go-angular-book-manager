start-db:
	docker run -d \
		--name storepractice-db \
		-e POSTGRES_USER=postgres \
		-e POSTGRES_PASSWORD=postgres \
		-e POSTGRES_DB=storepractice \
		-p 5432:5432 \
		-v storepractice-pgdata:/var/lib/postgresql/data \
		postgres:15

remove-db:
	docker stop storepractice-db || true
	docker rm storepractice-db || true
	docker volume rm storepractice-pgdata || true

migrate:
	cat ./backend/migrations/create_books.sql | docker exec -i storepractice-db psql -U postgres -d storepractice -f -

verify-migration:
	docker exec -i storepractice-db psql -U postgres -d storepractice -c "\dt"

start-backend:
	cd backend
	go run cmd/main.go

start-frontend:
	cd frontend/book-management
	ng serve
