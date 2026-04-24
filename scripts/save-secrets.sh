#!/usr/bin/env bash
# Saves Supabase keys to macOS Keychain AND writes .env.local.
# Run once after creating your Supabase project.
# Usage: bash scripts/save-secrets.sh

set -e

echo "Paste values from Supabase dashboard → Project Settings → API."
echo ""

read -rp "NEXT_PUBLIC_SUPABASE_URL (Project URL): " SUPABASE_URL
read -rp "NEXT_PUBLIC_SUPABASE_ANON_KEY (anon public): " SUPABASE_ANON
read -rsp "SUPABASE_SERVICE_ROLE_KEY (service_role, hidden): " SUPABASE_SERVICE
echo ""

# Random cron secret (never used in Week 1, needed from Week 3).
CRON_SECRET=$(openssl rand -hex 32)

# Save to macOS Keychain.
security add-generic-password -U -a "$USER" -s "invoiceapp-supabase-url"     -w "$SUPABASE_URL"
security add-generic-password -U -a "$USER" -s "invoiceapp-supabase-anon"    -w "$SUPABASE_ANON"
security add-generic-password -U -a "$USER" -s "invoiceapp-supabase-service" -w "$SUPABASE_SERVICE"
security add-generic-password -U -a "$USER" -s "invoiceapp-cron-secret"      -w "$CRON_SECRET"

# Write .env.local for local dev.
cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE
CRON_SECRET=$CRON_SECRET
APP_URL=http://localhost:2999

# Week 3+: fill these when you sign up for Resend.
RESEND_API_KEY=

# Week 4+: fill these when you set up Stripe.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
EOF

echo ""
echo "Saved to:"
echo "  1. macOS Keychain (search 'invoiceapp' in Keychain Access app)"
echo "  2. $(pwd)/.env.local"
echo ""
echo "To retrieve later: security find-generic-password -s invoiceapp-supabase-url -w"
