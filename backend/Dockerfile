FROM golang:1.25-alpine AS build
WORKDIR /app
# copy go.mod/go.sum and download deps first for caching
COPY go.mod go.sum ./
RUN go mod download

# copy the whole backend source
COPY . .

# adjust this build path to your main package location
RUN CGO_ENABLED=0 GOOS=linux go build -a -o /server ./cmd

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /server /server
RUN chmod +x /server
EXPOSE 8080
ENTRYPOINT [ "/server" ]