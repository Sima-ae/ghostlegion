#!/usr/bin/env bash
# Forwards local port 3307 → MariaDB on the VPS (127.0.0.1:3306 on the server).
# Port 3307 avoids clashing with catalogus / local MySQL on 3306.
#
# Usage:
#   npm run db:tunnel
#   npm run db:tunnel -- --background
#
# Then in another terminal: npm run dev
set -euo pipefail

VPS_HOST="${VPS_HOST:-89.116.38.197}"
SSH_USER="${SSH_USER:-root}"
LOCAL_PORT="${LOCAL_PORT:-3307}"
REMOTE_PORT="${REMOTE_PORT:-3306}"
BACKGROUND=false

if [[ "${1:-}" == "--background" || "${1:-}" == "-f" ]]; then
  BACKGROUND=true
fi

if lsof -i ":${LOCAL_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${LOCAL_PORT} is already in use (tunnel may already be running)."
  echo "Test with: npm run db:check"
  exit 0
fi

echo "Tunnel: localhost:${LOCAL_PORT} → ${SSH_USER}@${VPS_HOST}:127.0.0.1:${REMOTE_PORT}"
echo "Set .env.local DATABASE_URL host 127.0.0.1 port ${LOCAL_PORT}"
echo ""

if $BACKGROUND; then
  ssh -f -N -o ExitOnForwardFailure=yes \
    -L "${LOCAL_PORT}:127.0.0.1:${REMOTE_PORT}" \
    "${SSH_USER}@${VPS_HOST}"
  sleep 1
  if lsof -i ":${LOCAL_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Tunnel running. Test: npm run db:check"
  else
    echo "Tunnel failed to start. Run without --background to see SSH errors."
    exit 1
  fi
else
  echo "Keep this terminal open while developing. Press Ctrl+C to stop."
  echo ""
  exec ssh -N -o ExitOnForwardFailure=yes \
    -L "${LOCAL_PORT}:127.0.0.1:${REMOTE_PORT}" \
    "${SSH_USER}@${VPS_HOST}"
fi
