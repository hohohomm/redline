#!/usr/bin/env bash
# Verifies every var in .env.local.example is set locally + on Vercel.
# Usage: bash scripts/check-env.sh

set -euo pipefail

REQUIRED_FILE=".env.local.example"
LOCAL_FILE=".env.local"

if [[ ! -f "$REQUIRED_FILE" ]]; then
  echo "Missing $REQUIRED_FILE — nothing to check against."
  exit 1
fi

REQUIRED=$(grep -E '^[A-Z_]+=' "$REQUIRED_FILE" | sed 's/=.*//')

echo "Local (.env.local):"
if [[ -f "$LOCAL_FILE" ]]; then
  for var in $REQUIRED; do
    value=$(grep -E "^${var}=" "$LOCAL_FILE" | sed "s/^${var}=//" || true)
    if [[ -z "$value" ]]; then
      echo "  ✗ $var  (missing or blank)"
    else
      echo "  ✓ $var"
    fi
  done
else
  echo "  .env.local does not exist"
fi

echo ""
echo "Vercel (production):"
if ! command -v vercel >/dev/null; then
  echo "  vercel CLI not installed — skip"
  exit 0
fi

VERCEL_VARS=$(vercel env ls production 2>/dev/null | awk 'NR>1 {print $1}')
for var in $REQUIRED; do
  if echo "$VERCEL_VARS" | grep -qx "$var"; then
    echo "  ✓ $var"
  else
    echo "  ✗ $var  (missing)"
  fi
done
