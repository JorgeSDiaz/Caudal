# syntax=docker/dockerfile:1

FROM golang:1.26-bookworm AS dev
WORKDIR /app
COPY go.mod go.sum* ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
EXPOSE 8000
CMD ["go", "run", "./cmd/api"]

FROM golang:1.26-bookworm AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12 AS runtime
WORKDIR /app
COPY --from=build /out/api /app/api
COPY db/migrations /app/db/migrations
COPY openapi /app/openapi
EXPOSE 8000
CMD ["/app/api"]
