#!/usr/bin/env bash
# RedLine smoke — run after deploy.
set -e

APP_URL="${APP_URL:-https://redlineinvoices.com}"
SECRET=$(security find-generic-password -s invoiceapp-cron-secret -w 2>/dev/null || echo "")

if [ -z "$SECRET" ]; then
  echo "✗ CRON_SECRET not in keychain"
  exit 1
fi

echo "→ ping app root"
curl -sI "$APP_URL" | head -1

echo "→ /terms loads"
curl -sI "$APP_URL/terms" | head -1

echo "→ /privacy loads"
curl -sI "$APP_URL/privacy" | head -1

echo "→ /contact loads"
curl -sI "$APP_URL/contact" | head -1

echo "→ /login loads"
curl -sI "$APP_URL/login" | head -1

echo "→ cron auth blocks no-token"
curl -s -o /dev/null -w "%{http_code}\n" "$APP_URL/api/cron/reminders"
# Expect: 401

echo "→ cron with token"
curl -s -H "Authorization: Bearer $SECRET" "$APP_URL/api/cron/reminders"
# Expect: JSON {processed:N}

echo "→ stripe webhook reject no-sig"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$APP_URL/api/stripe/webhook"
# Expect: 400

echo "✓ smoke pass"
