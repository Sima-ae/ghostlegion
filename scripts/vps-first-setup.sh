#!/usr/bin/env bash
# One-time VPS bootstrap: dirs, clone repo, systemd.
# Run as root on 89.116.38.197:
#   bash /var/www/ghostlegion/app/scripts/vps-first-setup.sh
set -euo pipefail

APP_ROOT="/var/www/ghostlegion"
APP_DIR="$APP_ROOT/app"
SHARED_DIR="$APP_ROOT/shared"
PUBLIC_HTML="/home/ghostlegion.online/public_html"
REPO="https://github.com/Sima-ae/ghostlegion.git"
PORT=3017

echo "==> directories"
mkdir -p "$APP_DIR" "$SHARED_DIR" "$PUBLIC_HTML"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "==> clone repo"
  if [[ -z "$(ls -A "$APP_DIR" 2>/dev/null || true)" ]]; then
    git clone "$REPO" "$APP_DIR"
  else
    echo "WARN: $APP_DIR is not empty and has no .git — clone into a temp dir skipped"
  fi
fi

if [ ! -f "$SHARED_DIR/.env" ]; then
  echo ""
  echo "CREATE $SHARED_DIR/.env — copy from $APP_DIR/.env.vps.example and set secrets"
  cp -n "$APP_DIR/.env.vps.example" "$SHARED_DIR/.env" 2>/dev/null || true
  chmod 600 "$SHARED_DIR/.env" 2>/dev/null || true
fi

echo ""
echo "==> IPv4 (use for DNS / VPS_HOST if needed)"
curl -4 -sf --max-time 5 ifconfig.me 2>/dev/null || echo "89.116.38.197"
echo ""

if ! ss -tlnp | grep -q ":${PORT} "; then
  echo "Port ${PORT} is free (OK)"
else
  echo "WARN: port ${PORT} already in use"
  ss -tlnp | grep ":${PORT} " || true
fi

if [ -f "$APP_DIR/deploy/ghostlegion.service" ] && [ ! -f /etc/systemd/system/ghostlegion.service ]; then
  echo "==> install systemd unit"
  cp "$APP_DIR/deploy/ghostlegion.service" /etc/systemd/system/ghostlegion.service
  systemctl daemon-reload
  systemctl enable ghostlegion || true
fi

echo ""
echo "=== Next steps ==="
echo "1. Edit $SHARED_DIR/.env (DATABASE_URL, NEXTAUTH_SECRET)"
echo "2. Generate SQL locally (npm run db:sql) and import privately — do not commit database/*.sql"
echo "3. GitHub secrets: VPS_HOST=89.116.38.197 VPS_USER=root VPS_SSH_KEY (same as catalogus / toyotas)"
echo "   If SSH times out from GitHub: bash scripts/vps-allow-github-actions-ssh.sh"
echo "4. OpenLiteSpeed: bash $APP_DIR/scripts/configure-litespeed-ghostlegion.sh"
echo "5. Push to main → GitHub Actions deploys automatically"
