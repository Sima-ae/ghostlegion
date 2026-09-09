#!/usr/bin/env bash
# Allow GitHub Actions runners to SSH in for deploy (changing IP ranges).
# Run on VPS as root after deploy timeouts from GitHub Actions.
#
#   bash scripts/vps-allow-github-actions-ssh.sh
set -euo pipefail

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Run as root on the VPS"
  exit 1
fi

echo "=== GitHub Actions SSH allowlist ==="

TMP_META="$(mktemp)"
TMP_IPS="$(mktemp)"
trap 'rm -f "$TMP_META" "$TMP_IPS"' EXIT

curl -sf --max-time 60 -o "$TMP_META" https://api.github.com/meta || {
  echo "ERROR: Could not fetch https://api.github.com/meta"
  exit 1
}

python3 - "$TMP_META" "$TMP_IPS" <<'PY'
import json, sys
src, dst = sys.argv[1], sys.argv[2]
with open(src, "r") as f:
    data = json.load(f)
cidrs = data.get("actions") or []
with open(dst, "w") as out:
    for cidr in cidrs:
        if isinstance(cidr, str) and cidr.strip():
            out.write(cidr.strip() + "\n")
PY

if [[ ! -s "$TMP_IPS" ]]; then
  echo "ERROR: No actions IPs in GitHub meta response"
  exit 1
fi

IP_COUNT="$(wc -l < "$TMP_IPS" | tr -d ' ')"
echo "Found ${IP_COUNT} GitHub Actions CIDR ranges"

if command -v fail2ban-client >/dev/null 2>&1; then
  echo "--- fail2ban: unban all (clears blocked runner IPs) ---"
  fail2ban-client unban --all 2>/dev/null || true
  fail2ban-client status sshd 2>/dev/null || true
fi

if command -v csf >/dev/null 2>&1; then
  ALLOW="/etc/csf/csf.allow"
  [[ -f "$ALLOW" ]] || ALLOW="/etc/csf.allow"
  cp -a "$ALLOW" "${ALLOW}.bak.$(date +%Y%m%d%H%M%S)"
  sed -i '/# BEGIN GITHUB ACTIONS/,/# END GITHUB ACTIONS/d' "$ALLOW"
  {
    echo "# BEGIN GITHUB ACTIONS — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    cat "$TMP_IPS"
    echo "# END GITHUB ACTIONS"
  } >> "$ALLOW"
  csf -r
  echo "Updated CSF: ${ALLOW}"
elif command -v firewall-cmd >/dev/null 2>&1 && firewall-cmd --state >/dev/null 2>&1; then
  echo "--- firewalld: ensure ssh service is open ---"
  firewall-cmd --permanent --add-service=ssh 2>/dev/null || \
    firewall-cmd --permanent --add-port=22/tcp 2>/dev/null || true
  firewall-cmd --reload
  echo "firewalld: ssh/22 open."
elif command -v ufw >/dev/null 2>&1; then
  echo "--- ufw: allowing OpenSSH ---"
  ufw allow OpenSSH 2>/dev/null || ufw allow 22/tcp 2>/dev/null || true
  ufw reload 2>/dev/null || true
  echo "ufw updated"
else
  echo "WARN: No CSF/firewalld/ufw detected."
  echo "      Open port 22 in your host panel (Hostinger firewall)."
fi

echo ""
echo "--- SSH listener ---"
ss -tlnp | grep ':22' || echo "WARN: nothing listening on :22"

echo ""
curl -sf --max-time 5 ifconfig.me && echo " ← VPS public IP (must match GitHub secret VPS_HOST)"

echo ""
echo "Done. Re-run GitHub Actions deploy."
