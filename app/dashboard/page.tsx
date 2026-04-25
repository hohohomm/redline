import { DashboardHome, DashboardShell } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, status, due_date, created_at, paid_at, last_reminder_stage")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell route="dashboard">
      <DashboardHome invoices={invoices ?? []} />
    </DashboardShell>
  );
}
