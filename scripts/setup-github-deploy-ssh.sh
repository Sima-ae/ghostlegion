#!/usr/bin/env bash
# One-time on VPS as root. Creates deploy key for GitHub Actions SSH deploy.
# Prefer reusing the same VPS_SSH_KEY as catalogus / toyotas / inkoop.autos.
#
#   bash scripts/setup-github-deploy-ssh.sh
set -euo pipefail

if [[ "$(id -un)" != "root" ]]; then
  echo "ERROR: run as root"
  exit 1
fi

KEY=/root/.ssh/ghostlegion_github_deploy
AUTH=/root/.ssh/authorized_keys

mkdir -p /root/.ssh
chmod 700 /root/.ssh

if [[ ! -f "$KEY" ]]; then
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "ghostlegion-github-actions"
  chmod 600 "$KEY"
  chmod 644 "${KEY}.pub"
  echo "Created: $KEY"
else
  echo "Key exists: $KEY"
fi

PUB="$(cat "${KEY}.pub")"
if [[ -f "$AUTH" ]] && grep -qF "$PUB" "$AUTH" 2>/dev/null; then
  echo "OK: public key already in authorized_keys"
else
  echo "$PUB" >> "$AUTH"
  chmod 600 "$AUTH"
  echo "OK: added to authorized_keys"
fi

echo ""
echo "=== GitHub secrets (Sima-ae/ghostlegion) ==="
echo "  VPS_HOST = 89.116.38.197"
echo "  VPS_USER = root"
echo "  VPS_APP_PATH = /var/www/ghostlegion/app"
echo "  VPS_SSH_KEY = copy below OR reuse the same key as catalogus / toyotas"
echo ""
echo "----- VPS_SSH_KEY (private key) -----"
cat "$KEY"
echo "----- end -----"
echo ""
echo "If catalogus or toyotas deploy works: copy the same VPS_SSH_KEY secret — no new key needed."
