#!/usr/bin/env bash
# Morning setup — env vars + redeploy + unpause flow.
# Usage: bash scripts/morning-setup.sh

set -e

cd "$(dirname "$0")/.."

echo "RedLine — morning setup"
echo "------------------------"
echo ""

if ! command -v vercel >/dev/null; then
  echo "ERROR: vercel CLI not on PATH. Install: npm i -g vercel"
  exit 1
fi

if [[ ! -f ".vercel/project.json" ]]; then
  echo "ERROR: repo not linked to a Vercel project. Run: vercel link"
  exit 1
fi

ask() {
  local q="$1"
  read -rp "$q [y/N]: " a
  [[ "$a" =~ ^[yY]$ ]]
}

# 1. Stripe Connect webhook secret
if ask "Set STRIPE_CONNECT_WEBHOOK_SECRET on Vercel production?"; then
  echo ""
  echo "Paste signing secret from:"
  echo "  Stripe Dashboard → Developers → Webhooks → your Connect endpoint"
  echo ""
  vercel env add STRIPE_CONNECT_WEBHOOK_SECRET production
  echo "Set."
  echo ""
fi

# 2. Unpause logins
if ask "Unpause logins (remove LOGIN_PAUSED env var)?"; then
  vercel env rm LOGIN_PAUSED production --yes 2>/dev/null || true
  echo "LOGIN_PAUSED removed."
  echo ""
fi

# 3. Redeploy
if ask "Redeploy production now?"; then
  echo ""
  vercel --prod
  echo ""
fi

echo ""
echo "Verify pause status with:"
echo ""
echo "  curl -s https://redlineinvoices.com/api/auth/magic-link \\"
echo "    -X POST \\"
echo "    -H 'content-type: application/json' \\"
echo "    -d '{\"email\":\"verify@test.com\"}'"
echo ""
echo "  Paused → 503"
echo "  Unpaused → 200 (sent) or 400 (invalid email)"
echo ""
