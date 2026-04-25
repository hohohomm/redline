import { DashboardShell } from "@/components/redline-prototype";
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

  return (
    <DashboardShell route="settings">
      <div style={{ padding: 24, maxWidth: 640 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>
          Settings
        </h1>
        <div style={{ marginTop: 18, border: "1px solid var(--hair)", borderRadius: 8, padding: 18 }}>
          <div style={{ color: "var(--ash)", fontSize: 12 }}>Late fee</div>
          <div style={{ marginTop: 8 }}>
            {settings.late_fee_type === "percent" ? `${settings.late_fee_value}%` : `$${settings.late_fee_value}`} after{" "}
            {settings.late_fee_after_days} days
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
