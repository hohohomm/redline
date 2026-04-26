import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/redline-prototype";
import { InvoiceDetailActions } from "@/components/invoice-detail-actions";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

type Status = "draft" | "sent" | "paid" | "overdue" | "void";

const statusTone: Record<Status, { bg: string; color: string; border: string; label: string }> = {
  draft: { bg: "rgba(166,162,160,0.1)", color: "var(--ash)", border: "var(--hair)", label: "Draft" },
  sent: { bg: "rgba(107,166,255,0.12)", color: "#6ba6ff", border: "rgba(107,166,255,0.25)", label: "Sent" },
  paid: { bg: "rgba(46,194,126,0.12)", color: "#2ec27e", border: "rgba(46,194,126,0.25)", label: "Paid" },
  overdue: { bg: "rgba(255,75,62,0.15)", color: "#ff4b3e", border: "rgba(255,75,62,0.3)", label: "Overdue" },
  void: { bg: "rgba(166,162,160,0.08)", color: "var(--ash-dim)", border: "var(--hair)", label: "Void" },
};

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) notFound();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, subtotal, late_fee, status, due_date, issue_date, created_at, last_reminder_stage")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) notFound();

  const { data: lines } = await supabase
    .from("line_items")
    .select("id, description, quantity, unit_price, amount")
    .eq("invoice_id", invoice.id)
    .order("id", { ascending: true });

  const status = (invoice.status as Status) ?? "draft";
  const tone = statusTone[status];

  const subtotal = Number(invoice.subtotal ?? 0);
  const lateFee = Number(invoice.late_fee ?? 0);
  const total = Number(invoice.total ?? 0);

  return (
    <DashboardShell route="invoices">
      <div style={{ padding: 24, maxWidth: 1040 }}>
        <Link href="/dashboard/invoices" style={{ color: "var(--ash)", fontSize: 13, textDecoration: "none" }}>
          ← Back to invoices
        </Link>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>
                {invoice.client_name}
              </h1>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: tone.bg,
                  color: tone.color,
                  border: `1px solid ${tone.border}`,
                }}
              >
                ● {tone.label}
              </span>
            </div>
            <div style={{ color: "var(--ash)", fontSize: 13 }}>{invoice.client_email}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
              {money.format(total)}
            </div>
            <div style={{ fontSize: 12, color: "var(--ash-dim)", marginTop: 4 }}>Total</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <InvoiceDetailActions id={invoice.id} status={status} />
        </div>

        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 16 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Line items</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Qty</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Unit price</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(lines ?? []).map((line) => (
                  <tr key={line.id}>
                    <td style={tdStyle}>{line.description}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {Number(line.quantity)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {money.format(Number(line.unit_price ?? 0))}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {money.format(Number(line.amount ?? 0))}
                    </td>
                  </tr>
                ))}
                {(lines ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ ...tdStyle, color: "var(--ash-dim)", textAlign: "center", padding: "20px 0" }}>
                      No line items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--hair)", display: "grid", gap: 6 }}>
              <Row label="Subtotal" value={money.format(subtotal)} />
              {lateFee > 0 && <Row label="Late fee" value={money.format(lateFee)} />}
              <Row label="Total" value={money.format(total)} bold />
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Invoice info</h2>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <Row label="Issued" value={formatDate(invoice.issue_date)} />
              <Row label="Due" value={formatDate(invoice.due_date)} highlight={status === "overdue"} />
              <Row label="Reminder stage" value={String(invoice.last_reminder_stage ?? 0)} />
              <Row label="Created" value={formatDate(invoice.created_at?.slice(0, 10))} />
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "var(--ash)" }}>{label}</span>
      <span style={{
        color: highlight ? "#ff7468" : "var(--warm-white-dim)",
        fontWeight: bold ? 600 : 400,
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </span>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  border: "1px solid var(--hair)",
  borderRadius: 12,
  padding: 18,
  background: "rgba(22,24,31,0.45)",
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ash)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--ash-dim)",
  padding: "8px 0",
  borderBottom: "1px solid var(--hair)",
};

const tdStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--warm-white-dim)",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
