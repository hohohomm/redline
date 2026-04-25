import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDomainStatus } from "@/lib/email/resend-domain";

export const runtime = "nodejs";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");

  if (!domainId) {
    return NextResponse.json({ error: "Missing domainId query param" }, { status: 400 });
  }

  const status = await getDomainStatus(domainId);
  return NextResponse.json(status);
}
