#!/usr/bin/env bash
# Apply OpenLiteSpeed reverse proxy ghostlegion.online → :3017
# Run on VPS as root:
#   bash /var/www/ghostlegion/app/scripts/configure-litespeed-ghostlegion.sh
set -euo pipefail

DOMAIN="${DOMAIN:-ghostlegion.online}"
PORT="${PORT:-3017}"
MARKER="GHOSTLEGION.ONLINE Next.js reverse proxy"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SNIPPET="${ROOT}/deploy/openlitespeed-proxy.snippet"
PUBLIC_HTML="${PUBLIC_HTML:-/home/${DOMAIN}/public_html}"
OWNER="${OWNER:-admin}"
PHP="${PHP:-8.3}"
EMAIL="${EMAIL:-info@${DOMAIN}}"

cyberpanel_db_pass() {
  python3 - <<'PY'
import re
t = open("/usr/local/CyberCP/CyberCP/settings.py").read()
m = re.search(r"'NAME': 'cyberpanel'[\s\S]*?'PASSWORD': '([^']+)'", t)
print(m.group(1) if m else "")
PY
}

mysql_cp() {
  local pass
  pass="$(cyberpanel_db_pass)"
  mysql -ucyberpanel -p"$pass" cyberpanel "$@"
}

website_in_db() {
  mysql_cp -N -e "SELECT COUNT(*) FROM websiteFunctions_websites WHERE domain='${DOMAIN}'" 2>/dev/null | grep -qx 1
}

find_vhost() {
  local candidates=(
    "/usr/local/lsws/conf/vhosts/${DOMAIN}/vhost.conf"
    "/usr/local/lsws/conf/vhosts/${DOMAIN}/vhconf.conf"
    "/home/${DOMAIN}/conf/vhosts/${DOMAIN}/vhost.conf"
  )
  local path dir conf
  for path in "${candidates[@]}"; do
    [[ -f "$path" ]] && echo "$path" && return 0
  done
  for dir in /usr/local/lsws/conf/vhosts/*/; do
    [[ -d "$dir" ]] || continue
    for conf in "${dir}vhost.conf" "${dir}vhconf.conf"; do
      [[ -f "$conf" ]] || continue
      if grep -qE "(vhDomain|serverName).*${DOMAIN//./\\.}" "$conf" 2>/dev/null; then
        echo "$conf"
        return 0
      fi
      if grep -qF "${PUBLIC_HTML}" "$conf" 2>/dev/null; then
        echo "$conf"
        return 0
      fi
    done
  done
  return 1
}

ensure_cyberpanel_website() {
  if [[ -f "/usr/local/lsws/conf/vhosts/${DOMAIN}/vhost.conf" ]]; then
    return 0
  fi

  if ! command -v cyberpanel >/dev/null 2>&1; then
    echo "ERROR: cyberpanel CLI not found — create website in CyberPanel UI first"
    return 1
  fi

  if website_in_db; then
    echo "=== CyberPanel DB has ${DOMAIN} but LiteSpeed vhost is missing ==="
    echo "    Rebuilding vhost via delete + create (home dir kept at ${PUBLIC_HTML})"
    cyberpanel deleteWebsite --domainName "$DOMAIN" || true
    sleep 2
  else
    echo "=== Creating CyberPanel website ${DOMAIN} ==="
  fi

  local pkg=""
  pkg="$(mysql_cp -N -e "SELECT packageName FROM websiteFunctions_package LIMIT 1" 2>/dev/null || true)"
  if [[ -z "$pkg" ]]; then
    pkg="Default"
  fi

  echo "    package=${pkg} owner=${OWNER}"
  cyberpanel createWebsite \
    --package "$pkg" \
    --owner "$OWNER" \
    --domainName "$DOMAIN" \
    --email "$EMAIL" \
    --php "$PHP" \
    --ssl 0 \
    --dkim 0 \
    --openBasedir 0

  sleep 2
  if [[ ! -f "/usr/local/lsws/conf/vhosts/${DOMAIN}/vhost.conf" ]]; then
    echo "ERROR: createWebsite finished but /usr/local/lsws/conf/vhosts/${DOMAIN}/vhost.conf still missing"
    return 1
  fi
  echo "=== LiteSpeed vhost created ==="
}

ensure_vhost_aliases() {
  local conf="$1"
  cp -a "$conf" "${conf}.bak.aliases.$(date +%s)"
  python3 - <<PY
from pathlib import Path
import re
p = Path("${conf}")
t = p.read_text()
t = re.sub(r"(?m)^docRoot\s+\S.*", "docRoot                   ${PUBLIC_HTML}", t, count=1)
if not re.search(r"(?m)^vhAliases\s+", t):
    t = re.sub(
        r"(?m)^(vhDomain\s+\$VH_NAME\s*)$",
        r"\1\nvhAliases                 www.\$VH_NAME",
        t,
        count=1,
    )
else:
    t = re.sub(r"(?m)^vhAliases\s+\S.*", "vhAliases                 www.\$VH_NAME", t, count=1)
p.write_text(t)
print("docRoot -> ${PUBLIC_HTML}, vhAliases -> www.\$VH_NAME")
PY
}

if [[ "$(id -un)" != "root" ]]; then
  echo "ERROR: run as root"
  exit 1
fi

if [[ ! -f "$SNIPPET" ]]; then
  echo "ERROR: missing $SNIPPET"
  exit 1
fi

VHOST="$(find_vhost || true)"
if [[ -z "$VHOST" ]]; then
  ensure_cyberpanel_website
  VHOST="$(find_vhost || true)"
fi

if [[ -z "$VHOST" ]]; then
  echo ""
  echo "ERROR: LiteSpeed vhost still not found for ${DOMAIN}"
  echo "Create the website in CyberPanel first, then re-run this script."
  exit 1
fi

echo "Using vhost: $VHOST"
ensure_vhost_aliases "$VHOST"

if [[ -f "${PUBLIC_HTML}/index.html" ]] && grep -qiE 'CyberPanel|Default Site|LiteSpeed' "${PUBLIC_HTML}/index.html" 2>/dev/null; then
  mv "${PUBLIC_HTML}/index.html" "${PUBLIC_HTML}/index.html.bak.$(date +%s)"
  echo "Renamed default CyberPanel index.html"
fi

if grep -q "$MARKER" "$VHOST" 2>/dev/null; then
  cp -a "$VHOST" "${VHOST}.bak.$(date +%Y%m%d%H%M%S)"
  sed -i "/# ${MARKER}/,/# END ${MARKER}/d" "$VHOST"
fi

{
  echo ""
  echo "# ${MARKER}"
  cat "$SNIPPET"
  echo "# END ${MARKER}"
} >> "$VHOST"

if [[ -x /usr/local/lsws/bin/lswsctrl ]]; then
  /usr/local/lsws/bin/lswsctrl reload </dev/null || /usr/local/lsws/bin/lswsctrl restart </dev/null
  echo "LiteSpeed reloaded"
fi

echo ""
echo "Done. Test:"
echo "  curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:${PORT}/"
echo "  curl -sk -o /dev/null -w '%{http_code}\\n' -H 'Host: ${DOMAIN}' https://127.0.0.1/"
echo ""
echo "If HTTPS still shows wrong cert: bash scripts/fix-ssl-ghostlegion.sh"
