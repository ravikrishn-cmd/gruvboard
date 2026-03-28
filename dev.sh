#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "Done."
}
trap cleanup EXIT INT TERM

echo "Starting GruvBoard dev environment..."
echo ""

# Start backend
echo "[backend] Starting FastAPI on http://127.0.0.1:9500"
uv run uvicorn backend.main:app --host 127.0.0.1 --port 9500 --reload &
BACKEND_PID=$!

# Start frontend
echo "[frontend] Starting Vite on http://localhost:5173"
cd frontend && pnpm dev &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo "GruvBoard running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://127.0.0.1:9500"
echo ""
echo "Press Ctrl+C to stop both."
echo ""

wait
