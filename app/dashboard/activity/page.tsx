import Link from "next/link";

import { DashboardShell } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

type Kind = "created" | "paid" | "reminder";

type Entry = {
  id: string;
  at: string;
  kind: Kind;
  invoiceId: string;
  invoiceLabel: string;
  clientName: string;
  detail: string;
};

const kindConfig: Record<Kind, { label: string; dot: string; bg: string; color: string; border: string }> = {
  created: { label: "Created", dot: "+", bg: "rgba(255,255,255,0.04)", color: "var(--ash)", border: "var(--hair)" },
  paid: { label: "Paid", dot: "✓", bg: "rgba(126,192,138,0.12)", color: "#9fd3aa", border: "rgba(126,192,138,0.25)" },
  reminder: { label: "Reminder", dot: "!", bg: "rgba(255,75,62,0.1)", color: "#ff7468", border: "rgba(255,75,62,0.25)" },
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
  );
};

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let entries: Entry[] = [];

  if (user) {
    const [{ data: invoices }, { data: reminders }] = await Promise.all([
      supabase
        .from("invoices")
        .select("id, client_name, created_at, paid_at, status, total")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("reminder_logs")
        .select("id, invoice_id, stage, sent_at, invoices:invoice_id(client_name, user_id)")
        .order("sent_at", { ascending: false })
        .limit(200),
    ]);

    const acc: Entry[] = [];

    for (const inv of invoices ?? []) {
      const label = `Invoice #${inv.id.slice(0, 8)}`;
      acc.push({
        id: `created:${inv.id}`,
        at: inv.created_at,
        kind: "created",
        invoiceId: inv.id,
        invoiceLabel: label,
        clientName: inv.client_name,
        detail: `Invoice created for ${inv.client_name}`,
      });
      if (inv.paid_at) {
        acc.push({
          id: `paid:${inv.id}`,
          at: inv.paid_at,
          kind: "paid",
          invoiceId: inv.id,
          invoiceLabel: label,
          clientName: inv.client_name,
          detail: `Payment received — A$${Number(inv.total ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`,
        });
      }
    }

    type ReminderRow = {
      id: string;
      invoice_id: string;
      stage: number;
      sent_at: string;
      invoices: { client_name: string; user_id: string } | { client_name: string; user_id: string }[] | null;
    };
    for (const r of (reminders ?? []) as unknown as ReminderRow[]) {
      const inv = Array.isArray(r.invoices) ? r.invoices[0] : r.invoices;
      if (!inv || inv.user_id !== user.id) continue;
      acc.push({
        id: `reminder:${r.id}`,
        at: r.sent_at,
        kind: "reminder",
        invoiceId: r.invoice_id,
        invoiceLabel: `Invoice #${r.invoice_id.slice(0, 8)}`,
        clientName: inv.client_name,
        detail: `Reminder stage ${r.stage} sent to ${inv.client_name}`,
      });
    }

    acc.sort((a, b) => (a.at < b.at ? 1 : -1));
    entries = acc.slice(0, 100);
  }

  return (
    <DashboardShell route="activity">
      <div style={{ padding: 24, maxWidth: 840 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>Activity</h1>
          <p style={{ margin: "8px 0 0", color: "var(--ash)", maxWidth: 600 }}>
            Chronological feed of invoice lifecycle events. Last 100 shown.
          </p>
        </div>

        <section
          style={{
            marginTop: 20,
            background: "rgba(22,24,31,0.45)",
            border: "1px solid var(--hair)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--hair)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>All events</span>
            <span style={{ fontSize: 12, color: "var(--ash-dim)", fontFamily: "var(--font-mono)" }}>
              {entries.length} events
            </span>
          </div>

          {entries.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ash-dim)", fontSize: 13 }}>
              No activity yet. Create your first invoice to get started.
            </div>
          ) : (
            <div>
              {entries.map((evt, i) => {
                const cfg = kindConfig[evt.kind];
                return (
                  <Link
                    key={evt.id}
                    href={`/dashboard/invoices/${evt.invoiceId}`}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "14px 18px",
                      borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      alignItems: "flex-start",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 13,
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      {cfg.dot}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: "var(--warm-white-dim)", lineHeight: 1.45 }}>
                        {evt.detail}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          marginTop: 4,
                          alignItems: "center",
                          fontSize: 11.5,
                          color: "var(--ash-dim)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <span>{formatDateTime(evt.at)}</span>
                        <span>{evt.invoiceLabel}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: cfg.color,
                        display: "inline-flex",
                        alignItems: "center",
                        height: 20,
                        padding: "0 8px",
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
