import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  const stripe = getStripe();
  let accountId = settings?.stripe_account_id ?? null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "standard",
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    accountId = account.id;

    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, stripe_account_id: accountId });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/settings?stripe=refresh`,
    return_url: `${appUrl}/dashboard/settings?stripe=connected`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
