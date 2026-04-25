"use server";

import { createClient } from "@/lib/supabase/server";
import { tourSchema, type TourFormValues } from "@/types/onboarding";
import { revalidatePath } from "next/cache";

export async function saveOnboardingTour(input: TourFormValues) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return { error: "Unauthorized" };
  }

  const parsed = tourSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data } = parsed;

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    owner_first_name: data.owner_first_name ?? null,
    business_name: data.business_name ?? null,
    currency: data.currency,
    late_fee_type: data.late_fee_type,
    late_fee_value: data.late_fee_value,
    late_fee_after_days: data.late_fee_after_days,
    reminder_tone: data.reminder_tone,
    onboarding_preset: data.onboarding_preset,
    onboarded: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
