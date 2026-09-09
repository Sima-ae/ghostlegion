#!/usr/bin/env bash
# Production deploy on the VPS (GitHub Actions SSH + manual runs).
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"

APP_DIR="${APP_DIR:-/var/www/ghostlegion/app}"
SHARED_ENV="${SHARED_ENV:-/var/www/ghostlegion/shared/.env}"
LOCK_FILE="${DEPLOY_LOCK:-/run/ghostlegion-deploy.lock}"
PORT="${PORT:-3017}"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "App repo missing at $APP_DIR"
  exit 1
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another deploy is already running — waiting up to 20 minutes…"
  flock -w 1200 9
fi

cd "$APP_DIR"
git config --global --add safe.directory "$APP_DIR" || true

echo "==> git pull"
git fetch origin main
git reset --hard origin/main

if [ ! -f "$SHARED_ENV" ]; then
  echo "ERROR: $SHARED_ENV missing — copy .env.vps.example and set DATABASE_URL / NEXTAUTH_SECRET"
  exit 1
fi

echo "==> install"
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed"
  exit 1
fi
node -e "const m = process.versions.node.match(/^(\\d+)/); if (!m || +m[1] < 20) { console.error('Node 20+ required'); process.exit(1); }"
npm ci

echo "==> build"
set -a
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"
  [[ -z "$line" || "$line" == \#* ]] && continue
  if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    export "$line"
  else
    echo "WARN: skipping non-assignment line in $SHARED_ENV: ${line:0:60}"
  fi
done < "$SHARED_ENV"
set +a
export NEXT_PUBLIC_BUILD_STAMP="$(git rev-parse --short HEAD)-$(date -u +%Y%m%d%H%M)"
echo "BUILD_STAMP=${NEXT_PUBLIC_BUILD_STAMP}"
npm run build

echo "==> prepare standalone"
STAGE=".next/standalone-stage.$$"
rm -rf "$STAGE"
mkdir -p "$STAGE/.next" "$STAGE/public"

cp -a .next/standalone/. "$STAGE/"
rm -rf "$STAGE/.next/static"
cp -a .next/static "$STAGE/.next/static"
rm -rf "$STAGE/public"
mkdir -p "$STAGE/public"
if [ -d public ]; then
  cp -a public/. "$STAGE/public/"
fi

# Never ship env files from the build tree into public/ or the standalone bundle.
find "$STAGE" \( -name '.env' -o -name '.env.*' \) \
  ! -name '.env.example' ! -name '.env.vps.example' -delete 2>/dev/null || true
find "$STAGE/public" \( -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.key' \) \
  -delete 2>/dev/null || true

chmod 600 "$SHARED_ENV"
ln -sfn "$SHARED_ENV" "$STAGE/.env"
ln -sfn "$SHARED_ENV" "$STAGE/.env.local"

mkdir -p "$STAGE/node_modules"
if [ -d node_modules/.prisma ]; then
  rm -rf "$STAGE/node_modules/.prisma"
  cp -a node_modules/.prisma "$STAGE/node_modules/.prisma"
fi
if [ -d node_modules/@prisma ]; then
  rm -rf "$STAGE/node_modules/@prisma"
  cp -a node_modules/@prisma "$STAGE/node_modules/@prisma"
fi

if [ ! -f "$STAGE/server.js" ]; then
  echo "ERROR: staged server.js missing — aborting restart"
  rm -rf "$STAGE"
  exit 1
fi

rm -rf .next/standalone.bak
if [ -d .next/standalone ]; then
  mv .next/standalone .next/standalone.bak
fi
mv "$STAGE" .next/standalone
rm -rf .next/standalone.bak

if [ -f deploy/ghostlegion.service ] && [ ! -f /etc/systemd/system/ghostlegion.service ]; then
  echo "==> install systemd unit"
  cp deploy/ghostlegion.service /etc/systemd/system/ghostlegion.service
  systemctl daemon-reload
  systemctl enable ghostlegion || true
fi

echo "==> restart"
systemctl restart ghostlegion || systemctl start ghostlegion
sleep 3
systemctl is-active --quiet ghostlegion

echo "==> smoke"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "http://127.0.0.1:${PORT}/" || echo 000)"
echo "  / → ${code}"
case "$code" in
  200|301|302|307|308) ;;
  *)
    echo "ERROR: smoke failed for / (HTTP ${code})"
    journalctl -u ghostlegion -n 40 --no-pager || true
    exit 1
    ;;
esac

health="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:${PORT}/api/health" || echo 000)"
echo "  /api/health → ${health}"

echo "Deploy OK ($(git rev-parse --short HEAD))"
