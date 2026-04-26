// GET /api/health — probes env, Supabase, Stripe, Resend.
// No auth required (uptime monitors). Returns no secrets or raw error messages.
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Timeout helper
// ---------------------------------------------------------------------------
function withTimeout<T>(p: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

// ---------------------------------------------------------------------------
// Probe types
// ---------------------------------------------------------------------------
type EnvCheck = { ok: boolean; missing: string[] };
type LatencyCheck = { ok: boolean; latencyMs: number };
type ResendCheck = { ok: boolean; latencyMs: number; domainCount: number };

// ---------------------------------------------------------------------------
// Probes
// ---------------------------------------------------------------------------
async function probeEnv(): Promise<EnvCheck> {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
    "APP_URL",
    "CRON_SECRET",
  ];
  const missing = required.filter((k) => !process.env[k]);
  return { ok: missing.length === 0, missing };
}

async function probeSupabase(): Promise<LatencyCheck> {
  const start = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    const client = createSupabaseClient(url, key);
    const result = await withTimeout(
      client.from("invoices").select("id").limit(1),
      2000,
    );
    const latencyMs = Date.now() - start;
    return { ok: !result.error, latencyMs };
  } catch {
    return { ok: false, latencyMs: Math.min(Date.now() - start, 2000) };
  }
}

async function probeStripe(): Promise<LatencyCheck> {
  const start = Date.now();
  try {
    const stripe = getStripe();
    await withTimeout(stripe.balance.retrieve(), 2000);
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Math.min(Date.now() - start, 2000) };
  }
}

async function probeResend(): Promise<ResendCheck> {
  const start = Date.now();
  try {
    const apiKey = process.env.RESEND_API_KEY ?? "";
    const res = await withTimeout(
      fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${apiKey}` },
      }),
      2000,
    );
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return { ok: false, latencyMs, domainCount: 0 };
    }
    const json = (await res.json()) as { data?: { status?: string }[] };
    const domains = json.data ?? [];
    // Count verified domains; fall back to total length if status field absent.
    const domainCount = domains.some((d) => "status" in d)
      ? domains.filter((d) => d.status === "verified").length
      : domains.length;
    return { ok: true, latencyMs, domainCount };
  } catch {
    return { ok: false, latencyMs: Math.min(Date.now() - start, 2000), domainCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export async function GET() {
  const [envResult, supabaseResult, stripeResult, resendResult] =
    await Promise.allSettled([
      probeEnv(),
      probeSupabase(),
      probeStripe(),
      probeResend(),
    ]);

  const env: EnvCheck =
    envResult.status === "fulfilled"
      ? envResult.value
      : { ok: false, missing: [] };

  const supabase: LatencyCheck =
    supabaseResult.status === "fulfilled"
      ? supabaseResult.value
      : { ok: false, latencyMs: 2000 };

  const stripe: LatencyCheck =
    stripeResult.status === "fulfilled"
      ? stripeResult.value
      : { ok: false, latencyMs: 2000 };

  const resend: ResendCheck =
    resendResult.status === "fulfilled"
      ? resendResult.value
      : { ok: false, latencyMs: 2000, domainCount: 0 };

  const allOk = env.ok && supabase.ok && stripe.ok && resend.ok;

  const body = {
    ok: allOk,
    checks: { env, supabase, stripe, resend },
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
