# GruvBoard

Custom self-hosted homelab dashboard with real-time health monitoring, systemd integration, and a plugin-based widget system. Styled in Gruvbox Dark.

## Requirements

- Python 3.12+ (with `uv` package manager)
- Node.js 18+ (with `pnpm` package manager)
- systemd (for service management via D-Bus)
- CachyOS / Arch Linux (or any systemd-based distro)

## Quick Start

### Install dependencies

```bash
just install
```

### Development

Run backend and frontend in separate terminals:

```bash
just dev-backend    # FastAPI on :9500
just dev-frontend   # Vite on :5173 (proxies /api to :9500)
```

### Production Build

```bash
just build   # Builds frontend, copies to backend/static/
```

### Deploy as systemd service

```bash
just deploy  # Copies service file, enables and starts gruvboard
```

## Configuration

Edit `config.toml` to add/remove monitored apps. Each `[[apps]]` block defines:

- `id` — unique identifier
- `name` — display name
- `icon` — lucide icon name
- `url` — app's web UI URL
- `health_endpoint` — path to ping for health checks
- `systemd_unit` — systemd service name
- `widget` — widget type (`generic`, `ollama`, `caddy`, or custom)
- `category` — grouping category
- `tags` — searchable tags

## Architecture

- **Backend:** FastAPI + uvicorn (async), psutil, dbus-next, httpx, aiosqlite
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS (Gruvbox), shadcn/ui, Recharts
- **Data:** SQLite for health check history and metrics snapshots
- **Real-time:** SSE (Server-Sent Events) for live updates
- **systemd:** D-Bus integration for native service status and control

## Upstream

Backend listens on `127.0.0.1:9500`. Configure your reverse proxy (e.g., Caddy) to proxy to this address.
