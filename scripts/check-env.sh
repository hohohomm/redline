#!/usr/bin/env bash
# Verifies every var in .env.local.example is set locally + on Vercel.
# Usage: bash scripts/check-env.sh

set -euo pipefail

REQUIRED_FILE=".env.local.example"
LOCAL_FILE=".env.local"
OPTIONAL_VARS="STRIPE_PRICE_STARTER STRIPE_PRICE_PRO"

if [[ ! -f "$REQUIRED_FILE" ]]; then
  echo "Missing $REQUIRED_FILE — nothing to check against."
  exit 1
fi

REQUIRED=$(grep -E '^[A-Z_]+=' "$REQUIRED_FILE" | sed 's/=.*//')

is_optional() {
  case " $OPTIONAL_VARS " in
    *" $1 "*) return 0 ;;
    *) return 1 ;;
  esac
}

has_value() {
  local value="$1"
  value="${value%$'\r'}"
  value="${value#\"}"
  value="${value%\"}"
  [[ -n "$value" ]]
}

echo "Local (.env.local):"
if [[ -f "$LOCAL_FILE" ]]; then
  for var in $REQUIRED; do
    value=$(grep -E "^${var}=" "$LOCAL_FILE" | sed "s/^${var}=//" || true)
    if has_value "$value"; then
      echo "  ✓ $var"
    elif is_optional "$var"; then
      echo "  - $var  (optional, blank)"
    else
      echo "  ✗ $var  (missing or blank)"
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
  elif is_optional "$var"; then
    echo "  - $var  (optional, missing)"
  else
    echo "  ✗ $var  (missing)"
  fi
done
