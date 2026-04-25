import { DashboardShell } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

type InvoiceRow = {
  id: string;
  client_name: string;
  client_email: string;
  total: number | string | null;
  status: string | null;
  due_date: string | null;
  last_reminder_stage: number | null;
};

const stages = [
  { stage: 0, label: "Not started", timing: "Draft / unsent", tone: "Quiet" },
  { stage: 1, label: "Friendly reminder", timing: "7 days overdue", tone: "Warm" },
  { stage: 2, label: "Overdue reminder", timing: "14 days overdue", tone: "Direct" },
  { stage: 3, label: "Late fee notice", timing: "21 days overdue", tone: "Firm" },
  { stage: 4, label: "Final notice", timing: "30 days overdue", tone: "Strict" },
];

export default async function SequencesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, status, due_date, last_reminder_stage")
    .in("status", ["sent", "overdue"])
    .order("due_date", { ascending: true });

  const invoices = ((data ?? []) as InvoiceRow[]).map((invoice) => {
    const stage = Number(invoice.last_reminder_stage ?? 0);
    const nextStage = stages.find((item) => item.stage === Math.min(stage + 1, 4)) ?? stages[0];

    return {
      ...invoice,
      stage,
      nextStage,
    };
  });

  return (
    <DashboardShell route="sequences">
      <div style={{ padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>Sequences</h1>
        <p style={{ margin: "8px 0 0", color: "var(--ash)", maxWidth: 680 }}>
          Follow-up ladder for open invoices. Cron advances stages; this page shows what is queued next.
        </p>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
          {stages.map((stage) => (
            <div key={stage.stage} style={{ border: "1px solid var(--hair)", borderRadius: 8, padding: 12, background: "rgba(22,24,31,0.45)" }}>
              <div style={{ color: "#ff7468", fontFamily: "var(--font-mono)", fontSize: 11 }}>STAGE {stage.stage}</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>{stage.label}</div>
              <div style={{ marginTop: 4, color: "var(--ash)", fontSize: 11 }}>{stage.timing}</div>
            </div>
          ))}
        </div>

        <table style={{ marginTop: 18, width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "var(--ash)", textAlign: "left" }}>
              <th style={headCell}>Client</th>
              <th style={headCell}>Status</th>
              <th style={headCell}>Current stage</th>
              <th style={headCell}>Next action</th>
              <th style={headCell}>Due date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={bodyCell}>
                  {invoice.client_name}
                  <div style={{ color: "var(--ash)", fontSize: 11, marginTop: 2 }}>{invoice.client_email}</div>
                </td>
                <td style={{ ...bodyCell, textTransform: "capitalize" }}>{invoice.status}</td>
                <td style={bodyCell}>Stage {invoice.stage}</td>
                <td style={bodyCell}>
                  {invoice.nextStage.label}
                  <div style={{ color: "var(--ash)", fontSize: 11, marginTop: 2 }}>{invoice.nextStage.tone}</div>
                </td>
                <td style={bodyCell}>{invoice.due_date}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 20, color: "var(--ash)" }}>No active sequences.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

const headCell = {
  padding: "10px 8px",
  borderBottom: "1px solid var(--hair)",
};

const bodyCell = {
  padding: "12px 8px",
  borderBottom: "1px solid var(--hair-soft)",
};
