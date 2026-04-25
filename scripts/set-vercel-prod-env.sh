#!/usr/bin/env bash
# Sets RedLine production environment variables on Vercel without Vercel's
# interactive sensitive/public prompts.
# Usage: bash scripts/set-vercel-prod-env.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v vercel >/dev/null; then
  echo "ERROR: vercel CLI is not installed or not on PATH."
  exit 1
fi

if ! command -v openssl >/dev/null; then
  echo "ERROR: openssl is required to generate CRON_SECRET."
  exit 1
fi

if [[ ! -f ".vercel/project.json" ]]; then
  echo "ERROR: this repo is not linked to a Vercel project."
  echo "Run: vercel link"
  exit 1
fi

echo "This sets Vercel production env vars for the linked RedLine project."
echo "Secrets are hidden while you type. Nothing is written to .env.local."
echo ""

read_public() {
  local label="$1"
  local var_name="$2"
  local default_value="${3:-}"

  if [[ -n "$default_value" ]]; then
    read -rp "$label [$default_value]: " value
    printf -v "$var_name" "%s" "${value:-$default_value}"
  else
    read -rp "$label: " value
    printf -v "$var_name" "%s" "$value"
  fi
}

read_secret() {
  local label="$1"
  local var_name="$2"

  read -rsp "$label: " value
  echo ""
  printf -v "$var_name" "%s" "$value"
}

require_value() {
  local name="$1"
  local value="$2"

  if [[ -z "$value" ]]; then
    echo "ERROR: $name cannot be blank."
    exit 1
  fi
}

set_vercel_env() {
  local name="$1"
  local value="$2"
  local visibility="$3"

  if [[ -z "$value" ]]; then
    echo "skip $name"
    return
  fi

  local args=(env add "$name" production --force --yes --non-interactive)

  if [[ "$visibility" == "public" ]]; then
    args+=(--no-sensitive)
  else
    args+=(--sensitive)
  fi

  printf "%s\n" "$value" | vercel "${args[@]}" >/dev/null
  echo "set $name"
}

read_public "NEXT_PUBLIC_SUPABASE_URL (base URL, not /rest/v1)" NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL%/}"
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL%/rest/v1}"
require_value "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"

read_public "NEXT_PUBLIC_SUPABASE_ANON_KEY / publishable key" NEXT_PUBLIC_SUPABASE_ANON_KEY
require_value "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

read_secret "SUPABASE_SERVICE_ROLE_KEY / secret key" SUPABASE_SERVICE_ROLE_KEY
require_value "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"

read_secret "RESEND_API_KEY" RESEND_API_KEY
require_value "RESEND_API_KEY" "$RESEND_API_KEY"

read_secret "STRIPE_SECRET_KEY" STRIPE_SECRET_KEY
require_value "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"

read_secret "STRIPE_WEBHOOK_SECRET" STRIPE_WEBHOOK_SECRET
require_value "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"

read_secret "CRON_SECRET (blank = generate)" CRON_SECRET
if [[ -z "$CRON_SECRET" ]]; then
  CRON_SECRET="$(openssl rand -hex 32)"
  echo "generated CRON_SECRET"
fi

read_public "APP_URL" APP_URL "https://redline-vert.vercel.app"
APP_URL="${APP_URL%/}"
require_value "APP_URL" "$APP_URL"

read_public "ADMIN_EMAILS" ADMIN_EMAILS "phillippreketes@gmail.com"

echo ""
echo "Optional Stripe price IDs. Leave blank if you have not created products yet."
read_public "STRIPE_PRICE_STARTER" STRIPE_PRICE_STARTER
read_public "STRIPE_PRICE_PRO" STRIPE_PRICE_PRO

echo ""
echo "Writing to Vercel production..."

set_vercel_env "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" public
set_vercel_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" public
set_vercel_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" secret
set_vercel_env "RESEND_API_KEY" "$RESEND_API_KEY" secret
set_vercel_env "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" secret
set_vercel_env "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET" secret
set_vercel_env "CRON_SECRET" "$CRON_SECRET" secret
set_vercel_env "APP_URL" "$APP_URL" public
set_vercel_env "ADMIN_EMAILS" "$ADMIN_EMAILS" public
set_vercel_env "STRIPE_PRICE_STARTER" "$STRIPE_PRICE_STARTER" secret
set_vercel_env "STRIPE_PRICE_PRO" "$STRIPE_PRICE_PRO" secret

echo ""
echo "Done. Redeploy production so Vercel uses the new env vars:"
echo "  vercel --prod"
echo ""
echo "Then verify:"
echo "  bash scripts/check-env.sh"
