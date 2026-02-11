.PHONY: all build run-api run-gateway migrate-up migrate-down frontend dev clean

# Backend
BACKEND_DIR := backend
API_BIN := $(BACKEND_DIR)/bin/api
GATEWAY_BIN := $(BACKEND_DIR)/bin/gateway

all: build

build: build-api build-gateway

build-api:
	cd $(BACKEND_DIR) && go build -o bin/api ./cmd/api

build-gateway:
	cd $(BACKEND_DIR) && go build -o bin/gateway ./cmd/gateway

run-api: build-api
	$(API_BIN)

run-gateway: build-gateway
	$(GATEWAY_BIN)

# Database migrations
migrate-up:
	cd $(BACKEND_DIR) && go run ./cmd/api -migrate-up

migrate-down:
	cd $(BACKEND_DIR) && go run ./cmd/api -migrate-down

# Frontend
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

# Docker
up:
	docker compose up -d

down:
	docker compose down

# Dev: run everything with goreman
dev:
	goreman -f Procfile.dev start

# Dev: run Postgres + Redis in Docker, services locally
dev-infra:
	docker compose up -d postgres redis

# Clean
clean:
	rm -rf $(BACKEND_DIR)/bin
	rm -rf frontend/dist
	rm -rf frontend/node_modules
