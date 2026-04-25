import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const next = requestUrl.searchParams.get("next");
  const nextPath = next?.startsWith("/") ? next : "/dashboard";

  if (!tokenHash) {
    return NextResponse.redirect(new URL("/login?error=auth", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
