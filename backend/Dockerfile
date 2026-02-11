FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 go build -o /bin/api ./cmd/api
RUN CGO_ENABLED=0 go build -o /bin/gateway ./cmd/gateway

FROM alpine:3.19 AS api
RUN apk add --no-cache ca-certificates
COPY --from=builder /bin/api /usr/local/bin/api
COPY --from=builder /app/internal/database/migrations /migrations
ENTRYPOINT ["api"]

FROM alpine:3.19 AS gateway
RUN apk add --no-cache ca-certificates
COPY --from=builder /bin/gateway /usr/local/bin/gateway
ENTRYPOINT ["gateway"]
