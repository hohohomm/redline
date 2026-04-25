import { DashboardShell } from "@/components/redline-prototype";
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

  return (
    <DashboardShell route="settings">
      <div style={{ padding: 24, maxWidth: 1040 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>Settings</h1>
          <p style={{ margin: "8px 0 0", color: "var(--ash)", maxWidth: 720 }}>
            Operator defaults for reminders, late fees, sending identity, payment collection, and account controls.
          </p>
        </div>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 14 }}>
          <Panel title="Late-fee rules" body="This is live. It feeds reminder escalation when invoices stay unpaid.">
            <SettingsForm initialSettings={settings} />
          </Panel>

          <Panel title="Email identity" body="What clients see when Redline sends invoices and reminders.">
            <ReadOnly label="From address" value="support@redlineinvoices.com / invoices@redlineinvoices.com" />
            <ReadOnly label="Reply handling" value="Replies should route back to your support inbox." />
            <ReadOnly label="Domain status" value="Verify outbound sending in Resend before real launch." />
          </Panel>

          <Panel title="Reminder sequence" body="Default cadence Redline uses before and after due dates.">
            <ReadOnly label="Stage 1" value="Friendly reminder at 7 days overdue." />
            <ReadOnly label="Stage 2" value="Direct reminder at 14 days overdue." />
            <ReadOnly label="Stage 3" value="Late-fee notice after your configured day." />
            <ReadOnly label="Stage 4" value="Final notice at 30 days overdue." />
          </Panel>

          <Panel title="Payment collection" body="Stripe payment links and paid-state handling.">
            <ReadOnly label="Checkout" value="One-time Stripe checkout per invoice." />
            <ReadOnly label="Webhook" value="Marks invoice paid and writes paid_at." />
            <ReadOnly label="Manual action" value="Copy pay link from invoice list." />
          </Panel>

          <Panel title="Notifications" body="What the owner should know without opening the app.">
            <ReadOnly label="New contact messages" value="Send to support inbox." />
            <ReadOnly label="Reminder failures" value="Log error.caught event." />
            <ReadOnly label="Daily summary" value="Next useful add: open/overdue digest." />
          </Panel>

          <Panel title="Account and data" body="Controls a real user expects before trusting billing workflow.">
            <ReadOnly label="Export" value="Invoice and client CSV export." />
            <ReadOnly label="Security" value="Magic-link auth through Supabase." />
            <ReadOnly label="Legal" value="Terms, privacy, and support contact in footer." />
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}

function Panel({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ border: "1px solid var(--hair)", borderRadius: 8, padding: 18, background: "rgba(22,24,31,0.45)" }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{title}</h2>
      <p style={{ margin: "6px 0 16px", color: "var(--ash)", fontSize: 13, lineHeight: 1.5 }}>{body}</p>
      <div style={{ display: "grid", gap: 10 }}>{children}</div>
    </section>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ color: "var(--ash)", fontSize: 11 }}>{label}</div>
      <div style={{ fontSize: 13, lineHeight: 1.45 }}>{value}</div>
    </div>
  );
}
