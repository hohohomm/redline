import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type BusinessRequest = {
  business_name: string | null;
  business_email: string | null;
  abn: string | null;
  default_payment_terms: string;
  reminder_tone: "Friendly" | "Direct" | "Firm";
};

const ALLOWED_TERMS = new Set(["Due on receipt", "Net 7", "Net 14", "Net 30", "Net 60"]);
const ALLOWED_TONES = new Set(["Friendly", "Direct", "Firm"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BusinessRequest;
  try {
    body = (await request.json()) as BusinessRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!ALLOWED_TERMS.has(body.default_payment_terms)) {
    return NextResponse.json({ error: "Invalid payment terms" }, { status: 400 });
  }
  if (!ALLOWED_TONES.has(body.reminder_tone)) {
    return NextResponse.json({ error: "Invalid reminder tone" }, { status: 400 });
  }

  const trim = (v: string | null) => {
    if (v == null) return null;
    const t = v.trim();
    return t.length === 0 ? null : t.slice(0, 200);
  };

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      business_name: trim(body.business_name),
      business_email: trim(body.business_email),
      abn: trim(body.abn),
      default_payment_terms: body.default_payment_terms,
      reminder_tone: body.reminder_tone,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
