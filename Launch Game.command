#!/bin/bash
cd "$(dirname "$0")"

PORT=8000
while lsof -i ":$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

python3 serve.py "$PORT" &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT"

echo "Empreiteiro Azeiteiro running at http://localhost:$PORT"
echo "Close this window (or press Ctrl+C) to stop the server."
wait $SERVER_PID
