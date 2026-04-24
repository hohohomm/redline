import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type SettingsRequest = {
  late_fee_type: "percent" | "flat";
  late_fee_value: number;
  late_fee_after_days: number;
};

async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return { supabase, user: data.user };
}

export async function GET() {
  const { supabase, user } = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  const { data, error } = await supabase
    .from("user_settings")
    .insert({ user_id: user.id })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user } = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SettingsRequest;

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      late_fee_type: body.late_fee_type,
      late_fee_value: body.late_fee_value,
      late_fee_after_days: body.late_fee_after_days,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
