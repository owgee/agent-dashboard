#!/bin/bash
set -e

echo "Starting Agent Dashboard..."
echo ""

# Start FastAPI backend
echo "[1/3] Starting Python backend on :8000..."
cd "$(dirname "$0")/backend"
pip install -q -r requirements.txt 2>/dev/null
python3 api.py &
BACKEND_PID=$!
echo "       Backend PID: $BACKEND_PID"

# Start Next.js frontend
echo "[2/3] Installing frontend deps..."
cd "$(dirname "$0")"
npm install --silent 2>/dev/null

echo "[3/3] Starting Next.js on :3000..."
npm run dev &
FRONTEND_PID=$!
echo "       Frontend PID: $FRONTEND_PID"

echo ""
echo "  Dashboard:   http://localhost:3000"
echo "  API:         http://localhost:8000/api/stats"
echo ""
echo "  Press Ctrl+C to stop both servers"

trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
