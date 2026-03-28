# GruvBoard — Homelab Dashboard

set dotenv-load

project_dir := justfile_directory()
frontend_dir := project_dir / "frontend"

# Development: run backend with hot reload
dev-backend:
    uv run uvicorn backend.main:app --host 127.0.0.1 --port 9500 --reload

# Development: run frontend Vite dev server
dev-frontend:
    cd {{frontend_dir}} && pnpm dev

# Build frontend for production
build-frontend:
    cd {{frontend_dir}} && pnpm build

# Copy built frontend to backend static dir
build: build-frontend
    rm -rf backend/static
    cp -r {{frontend_dir}}/dist backend/static

# Install all dependencies
install:
    uv sync
    cd {{frontend_dir}} && pnpm install

# Run backend tests
test:
    uv run pytest -v

# Lint backend
lint-backend:
    uv run ruff check backend/ tests/

# Lint frontend
lint-frontend:
    cd {{frontend_dir}} && npx tsc --noEmit

# Lint all
lint: lint-backend lint-frontend

# Deploy: build + install systemd service
deploy: build
    sudo cp deploy/gruvboard.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable gruvboard
    sudo systemctl restart gruvboard

# Check service status
status:
    systemctl status gruvboard
