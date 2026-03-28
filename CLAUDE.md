# GruvBoard

Homelab dashboard: FastAPI backend (Python 3.14, uv) + React/Vite frontend (pnpm, TypeScript).

## Commands
- `just dev-backend` — run backend with hot reload on :9500
- `just dev-frontend` — run Vite dev server
- `just test` — run pytest (`uv run pytest -v`)
- `just lint` — lint backend (ruff) + frontend (tsc)
- `just build` — build frontend and copy to backend/static
- `just deploy` — build + install systemd service

## Code Style
- Python: ruff, line-length 100, target py314
- Frontend: TypeScript strict, Tailwind CSS, Gruvbox color theme
- pytest with asyncio_mode = "auto"

## Gotchas
- Static file mount in backend/main.py MUST be registered after API routers (catch-all `/` intercepts `/api/*`)
- sudo commands require interactive auth — cannot run in Claude Code sandbox
