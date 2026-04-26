import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { buildEmail, escapeHtml } from "@/lib/email/template-base";
import { getClientKey, rateLimit } from "@/lib/rate-limit";

type MagicLinkRequest = {
  email?: string;
};

function cleanEmail(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function loginEmailHtml({ email, actionLink }: { email: string; actionLink: string }) {
  const safeEmail = escapeHtml(email);
  const safeActionLink = escapeHtml(actionLink);

  return buildEmail({
    title: "Sign in to Redline",
    intro: "Use this secure link to open your dashboard. It works once and expires soon.",
    ctaLabel: "Open dashboard",
    ctaUrl: actionLink,
    footer: `Requested for ${safeEmail}. If the button does not work, paste this link into your browser: <span style="word-break:break-all;color:#ff9a91;">${safeActionLink}</span>`,
  });
}

export async function POST(request: Request) {
  if (process.env.LOGIN_PAUSED === "true") {
    return NextResponse.json(
      { error: "Sign-in is paused while we finalise launch. Back shortly." },
      { status: 503 },
    );
  }

  const rlResult = rateLimit(getClientKey(request), 5, 10 * 60 * 1000);
  if (!rlResult.ok) {
    const retryAfter = Math.ceil((rlResult.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "rate_limited", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body = (await request.json()) as MagicLinkRequest;
  const email = cleanEmail(body.email);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const tokenHash = data.properties?.hashed_token;

  if (error || !tokenHash) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create sign-in link" },
      { status: 500 },
    );
  }

  const actionLink = `${origin}/auth/verify?token_hash=${encodeURIComponent(tokenHash)}&next=/dashboard`;

  await sendEmail({
    to: email,
    subject: "Sign in to Redline",
    html: loginEmailHtml({
      email,
      actionLink,
    }),
  });

  return NextResponse.json({ ok: true });
}
