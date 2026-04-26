// GET /api/health — probes env, Supabase, Stripe, Resend.
// No auth required (uptime monitors). Returns no secrets or raw error messages.
// ?debug=1 with the correct x-cron-secret header also returns the last
// raw error strings for the probes, to help diagnose a persistent 503.
import { NextResponse, type NextRequest } from "next/server";
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
type LatencyCheck = { ok: boolean; latencyMs: number; _err?: string };
type ResendCheck = { ok: boolean; latencyMs: number; domainCount: number; _err?: string };

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
    const client = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Try HEAD count first (cheapest, schema-agnostic). Fall back to user_settings
    // (every deployment has this table per migration 0003) if invoices missing.
    let result: { error: { message?: string } | null } = await withTimeout(
      client.from("invoices").select("id", { head: true, count: "exact" }).limit(1),
      2000,
    );
    if (result.error) {
      result = await withTimeout(
        client.from("user_settings").select("user_id", { head: true, count: "exact" }).limit(1),
        2000,
      );
    }
    const latencyMs = Date.now() - start;
    if (result.error) {
      return { ok: false, latencyMs, _err: String(result.error.message ?? result.error) };
    }
    return { ok: true, latencyMs };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.min(Date.now() - start, 2000),
      _err: err instanceof Error ? err.message : String(err),
    };
  }
}

async function probeStripe(): Promise<LatencyCheck> {
  const start = Date.now();
  try {
    const stripe = getStripe();
    await withTimeout(stripe.balance.retrieve(), 2000);
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.min(Date.now() - start, 2000),
      _err: err instanceof Error ? err.message : String(err),
    };
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
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.min(Date.now() - start, 2000),
      domainCount: 0,
      _err: err instanceof Error ? err.message : String(err),
    };
  }
}

function stripErr<T extends object>(obj: T): T {
  // Remove any _err keys before returning to unauthenticated callers.
  const out = { ...obj } as Record<string, unknown>;
  delete out._err;
  return out as unknown as T;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
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

  // Debug mode: gated by x-cron-secret matching CRON_SECRET. Returns raw
  // probe error strings so the operator can see WHY a probe is failing
  // without exposing them to public uptime monitors.
  const debug =
    request.nextUrl.searchParams.get("debug") === "1" &&
    request.headers.get("x-cron-secret") === (process.env.CRON_SECRET ?? "__unset__");

  const body = {
    ok: allOk,
    checks: debug
      ? { env, supabase, stripe, resend }
      : {
          env,
          supabase: stripErr(supabase),
          stripe: stripErr(stripe),
          resend: stripErr(resend),
        },
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
