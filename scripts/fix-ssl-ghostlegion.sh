#!/usr/bin/env bash
# Fix SSL for ghostlegion.online + www.ghostlegion.online on CyberPanel VPS with nginx on :80.
# Run on VPS as root:
#   bash /var/www/ghostlegion/app/scripts/fix-ssl-ghostlegion.sh
set -euo pipefail

DOMAIN="${DOMAIN:-ghostlegion.online}"
WWW="www.${DOMAIN}"
PUBLIC_HTML="${PUBLIC_HTML:-/home/${DOMAIN}/public_html}"
VHOST="/usr/local/lsws/conf/vhosts/${DOMAIN}/vhost.conf"
ACME="${ACME:-/root/.acme.sh/acme.sh}"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
ACME_WEBROOT="/usr/local/lsws/Example/html"
ACME_DIR="${ACME_WEBROOT}/.well-known/acme-challenge"
NGINX_SNIPPET="/etc/nginx/conf.d/ghostlegion.online-acme.conf"

if [[ "$(id -un)" != "root" ]]; then
  echo "ERROR: run as root"
  exit 1
fi

if [[ ! -f "$VHOST" ]]; then
  echo "ERROR: missing $VHOST"
  exit 1
fi

cert_sans() {
  echo | openssl s_client -connect 127.0.0.1:443 -servername "${1:-$DOMAIN}" 2>/dev/null \
    | openssl x509 -noout -ext subjectAltName 2>/dev/null || true
}

echo "=== SSL fix (nginx + CyberPanel ACME path) ==="
echo "Before SAN: $(cert_sans "$DOMAIN" | tr '\n' ' ')"
echo ""

cp -a "$VHOST" "${VHOST}.bak.ssl.$(date +%s)"
mkdir -p "$ACME_DIR"
chmod -R 755 "${ACME_WEBROOT}/.well-known" "$ACME_DIR"

python3 - <<PY
from pathlib import Path
import re
p = Path("${VHOST}")
t = p.read_text()
t = re.sub(r"(?m)^docRoot\s+\S.*", "docRoot                   ${PUBLIC_HTML}", t, count=1)
if not re.search(r"(?m)^vhAliases\s+", t):
    t = re.sub(r"(?m)^(vhDomain\s+\$VH_NAME\s*)$", r"\1\nvhAliases                 www.\$VH_NAME", t, count=1)
else:
    t = re.sub(r"(?m)^vhAliases\s+\S.*", "vhAliases                 www.\$VH_NAME", t, count=1)
acme = """
context /.well-known/acme-challenge/ {
  type                    static
  location                ${ACME_DIR}/
  allowBrowse             1
  addDefaultCharset       off
}
"""
t = re.sub(r"(?ms)^context /\.well-known/acme-challenge/\s*\{.*?\}\s*", "", t)
t = re.sub(r"(?ms)^context /\.well-known/acme-challenge\s*\{.*?\}\s*", "", t)
idx = t.find("context / {")
t = (t[:idx] + acme + "\n" + t[idx:]) if idx >= 0 else t.rstrip() + "\n" + acme
p.write_text(t)
print("OLS vhost: ACME → ${ACME_DIR}")
PY

if command -v nginx >/dev/null 2>&1; then
  cat > "$NGINX_SNIPPET" <<EOF
# ghostlegion.online — ACME HTTP-01 (Let's Encrypt). Managed by fix-ssl-ghostlegion.sh
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW};

    location ^~ /.well-known/acme-challenge/ {
        alias ${ACME_DIR}/;
        default_type "text/plain";
        allow all;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF
  nginx -t
  systemctl reload nginx || nginx -s reload
  echo "nginx: ${NGINX_SNIPPET}"
fi

/usr/local/lsws/bin/lswsctrl reload </dev/null || true
sleep 1

echo "ok-acme-test" > "${ACME_DIR}/ping-test"
HTTP_CODE="$(curl -s -o /tmp/acme-ping.out -w '%{http_code}' --max-time 10 \
  "http://${DOMAIN}/.well-known/acme-challenge/ping-test" || echo 000)"
BODY="$(cat /tmp/acme-ping.out 2>/dev/null || true)"
echo "ACME HTTP test: ${HTTP_CODE} body='${BODY}'"
rm -f "${ACME_DIR}/ping-test"
if [[ "$HTTP_CODE" != "200" ]] || [[ "$BODY" != *ok-acme-test* ]]; then
  echo "ERROR: ACME path still broken on HTTP"
  echo "Run: grep -r ${DOMAIN} /etc/nginx/ ; ss -tlnp | grep ':80 '"
  exit 1
fi

"$ACME" --set-default-ca --server letsencrypt
rm -rf "/root/.acme.sh/${DOMAIN}" "/root/.acme.sh/${DOMAIN}_ecc" 2>/dev/null || true
"$ACME" --remove -d "$DOMAIN" 2>/dev/null || true

echo "=== Issue production cert ==="
"$ACME" --issue \
  -d "$DOMAIN" \
  -d "$WWW" \
  -w "$ACME_WEBROOT" \
  --force \
  --server letsencrypt \
  --keylength 2048

mkdir -p "$CERT_DIR"
"$ACME" --install-cert -d "$DOMAIN" \
  --cert-file "${CERT_DIR}/cert.pem" \
  --key-file "${CERT_DIR}/privkey.pem" \
  --fullchain-file "${CERT_DIR}/fullchain.pem" \
  --reloadcmd "/usr/local/lsws/bin/lswsctrl reload"

python3 - <<PY
from pathlib import Path
import re
p = Path("${VHOST}")
t = p.read_text()
vhssl = """
vhssl  {
  keyFile                 ${CERT_DIR}/privkey.pem
  certFile                ${CERT_DIR}/fullchain.pem
  certChain               1
}
"""
if re.search(r"(?m)^vhssl\s*\{", t):
    t = re.sub(r"(?ms)^vhssl\s*\{.*?^\}\s*", vhssl.strip() + "\n", t, count=1)
else:
    t = t.rstrip() + "\n" + vhssl
p.write_text(t)
print("vhssl installed")
PY

/usr/local/lsws/bin/lswsctrl restart </dev/null || /usr/local/lsws/bin/lswsctrl reload </dev/null
sleep 2

if command -v cyberpanel >/dev/null 2>&1; then
  cyberpanel issueSSL --domainName "$DOMAIN" 2>/dev/null || true
  /usr/local/lsws/bin/lswsctrl reload </dev/null || true
fi

SANS="$(cert_sans "$DOMAIN")"
echo ""
echo "After SAN: ${SANS}"
if [[ "$SANS" == *"${DOMAIN}"* ]] && [[ "$SANS" == *"${WWW}"* ]] && [[ "$SANS" != *"do-it.vip"* ]]; then
  echo "=== SSL fixed ==="
  curl -sk -o /dev/null -w "https://${DOMAIN}/ → %{http_code}\n" "https://${DOMAIN}/"
  curl -sk -o /dev/null -w "https://${WWW}/ → %{http_code}\n" "https://${WWW}/"
  exit 0
fi
echo "FAIL: cert SAN still wrong — paste openssl output above"
exit 1
