import { SettingsForm } from "@/components/settings-form";
import { createClient } from "@/lib/supabase/server";
import type { LateFeeType } from "@/lib/late-fee";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let settings = {
    late_fee_type: "percent" as LateFeeType,
    late_fee_value: 5,
    late_fee_after_days: 21,
  };

  if (user) {
    const { data } = await supabase
      .from("user_settings")
      .select("late_fee_type, late_fee_value, late_fee_after_days")
      .eq("user_id", user.id)
      .single();

    if (data) {
      settings = {
        late_fee_type: data.late_fee_type as LateFeeType,
        late_fee_value: Number(data.late_fee_value),
        late_fee_after_days: Number(data.late_fee_after_days),
      };
    }
  }

  return <SettingsForm initialSettings={settings} />;
}
