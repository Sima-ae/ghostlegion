#!/usr/bin/env bash
# Fail if real env/secret files or SQL dumps are tracked in git.
# Allowed: .env.example, .env.vps.example, and prisma/migrations/**/*.sql.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

errors=0

tracked_env="$(git ls-files | grep -E '(^|/)\.env' || true)"
if [[ -n "$tracked_env" ]]; then
  bad_env="$(printf '%s\n' "$tracked_env" | grep -vE '(^|/)\.env\.example$|(^|/)\.env\.vps\.example$' || true)"
  if [[ -n "$bad_env" ]]; then
    echo "ERROR: secret env files must never be committed:"
    printf '%s\n' "$bad_env"
    errors=1
  fi
fi

tracked_sql="$(git ls-files | grep -Ei '\.sql$' || true)"
if [[ -n "$tracked_sql" ]]; then
  bad_sql="$(printf '%s\n' "$tracked_sql" | grep -vE '^prisma/migrations/' || true)"
  if [[ -n "$bad_sql" ]]; then
    echo "ERROR: SQL dumps must never be committed (generate locally with npm run db:sql):"
    printf '%s\n' "$bad_sql"
    errors=1
  fi
fi

leaked="$(git grep -nE 'ChangeMe!GhostLegion|\$2[aby]\$[0-9]{2}\$' -- . ':!package-lock.json' ':!package.json' ':!scripts/check-env-not-committed.sh' || true)"
if [[ -n "$leaked" ]]; then
  echo "ERROR: hardcoded password or bcrypt hash found in tracked files:"
  printf '%s\n' "$leaked"
  errors=1
fi

if [[ "$errors" -ne 0 ]]; then
  exit 1
fi

echo "OK: no secret env files, SQL dumps, or hardcoded credentials tracked"
