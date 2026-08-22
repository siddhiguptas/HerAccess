.PHONY: test lint build all

all: test lint build

test:
	@echo "Running Backend Tests..."
	pytest tests/

lint:
	@echo "Running Frontend Typecheck..."
	cd frontend && npm run build

build:
	@echo "Building Frontend..."
	cd frontend && npm run build
