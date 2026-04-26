import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

type Status = "draft" | "sent" | "paid" | "overdue" | "void";

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

const statusTone: Record<Status, { bg: string; color: string; border: string; label: string }> = {
  draft: { bg: "rgba(166,162,160,0.1)", color: "var(--ash)", border: "var(--hair)", label: "Draft" },
  sent: { bg: "rgba(107,166,255,0.12)", color: "#6ba6ff", border: "rgba(107,166,255,0.25)", label: "Sent" },
  paid: { bg: "rgba(46,194,126,0.12)", color: "#2ec27e", border: "rgba(46,194,126,0.25)", label: "Paid" },
  overdue: { bg: "rgba(255,75,62,0.15)", color: "#ff4b3e", border: "rgba(255,75,62,0.3)", label: "Overdue" },
  void: { bg: "rgba(166,162,160,0.08)", color: "var(--ash-dim)", border: "var(--hair)", label: "Void" },
};

export default async function ClientDetailPage({ params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) notFound();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, subtotal, late_fee, status, due_date, issue_date, paid_at, created_at, last_reminder_stage")
    .eq("user_id", user.id)
    .eq("client_email", email)
    .order("created_at", { ascending: false });

  if (!invoices || invoices.length === 0) {
    notFound();
  }

  const name = invoices.find((i) => i.client_name)?.client_name ?? email;

  let openTotal = 0;
  let paidTotal = 0;
  let overdueCount = 0;
  let lastPaidAt: string | null = null;
  let nextDue: string | null = null;

  for (const inv of invoices) {
    const total = Number(inv.total ?? 0);
    const status = (inv.status as Status) ?? "draft";
    const isOpen = status !== "paid" && status !== "void";
    if (isOpen) openTotal += total;
    if (status === "paid") paidTotal += total;
    if (status === "overdue") overdueCount += 1;
    if (inv.paid_at && (!lastPaidAt || inv.paid_at > lastPaidAt)) lastPaidAt = inv.paid_at;
    if (isOpen && inv.due_date && (!nextDue || inv.due_date < nextDue)) nextDue = inv.due_date;
  }

  const totalBilled = openTotal + paidTotal;
  const firstInvoiceAt = invoices[invoices.length - 1]?.created_at ?? null;

  return (
    <DashboardShell route="clients">
      <div style={{ padding: 24, maxWidth: 1040 }}>
        <Link href="/dashboard/clients" style={{ color: "var(--ash)", fontSize: 13, textDecoration: "none" }}>
          ← Back to clients
        </Link>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>{name}</h1>
            <div style={{ color: "var(--ash)", fontSize: 13, marginTop: 4 }}>{email}</div>
          </div>
          <Link
            href={`/dashboard/invoices/new?client=${encodeURIComponent(email)}`}
            style={{
              height: 36,
              padding: "0 14px",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              background: "linear-gradient(180deg,#ff4b3e 0%,#d8352a 100%)",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            New invoice for {name}
          </Link>
        </div>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          <Metric label="Open balance" value={money.format(openTotal)} tone={openTotal > 0 ? "amber" : "neutral"} />
          <Metric label="Total billed" value={money.format(totalBilled)} />
          <Metric label="Invoices" value={invoices.length.toString()} sub={`${overdueCount} overdue`} tone={overdueCount > 0 ? "red" : "neutral"} />
          <Metric label="Next due" value={nextDue ? formatDate(nextDue) : "—"} />
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
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Invoices</span>
            <span style={{ fontSize: 11.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)" }}>
              First billed {formatDate(firstInvoiceAt?.slice(0, 10) ?? null)}
              {lastPaidAt && ` · Last paid ${formatDate(lastPaidAt.slice(0, 10))}`}
            </span>
          </div>

          <div>
            {invoices.map((inv, i) => {
              const status = (inv.status as Status) ?? "draft";
              const tone = statusTone[status];
              return (
                <Link
                  key={inv.id}
                  href={`/dashboard/invoices/${inv.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr 120px 120px 100px",
                    gap: 14,
                    padding: "14px 18px",
                    borderBottom: i < invoices.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ash-dim)" }}>
                    #{inv.id.slice(0, 8)}
                  </span>
                  <span style={{ color: "var(--warm-white-dim)" }}>
                    Issued {formatDate(inv.issue_date)}
                  </span>
                  <span style={{ color: status === "overdue" ? "#ff7468" : "var(--warm-white-dim)" }}>
                    Due {formatDate(inv.due_date)}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                    {money.format(Number(inv.total ?? 0))}
                  </span>
                  <span
                    style={{
                      justifySelf: "end",
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 9px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 500,
                      background: tone.bg,
                      color: tone.color,
                      border: `1px solid ${tone.border}`,
                    }}
                  >
                    {tone.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function Metric({ label, value, sub, tone = "neutral" }: { label: string; value: string; sub?: string; tone?: "neutral" | "red" | "amber" }) {
  const color = tone === "red" ? "#ff7468" : tone === "amber" ? "#f0ce93" : "var(--warm-white)";
  return (
    <div style={{ border: "1px solid var(--hair)", borderRadius: 10, padding: 14, background: "rgba(22,24,31,0.45)" }}>
      <div style={{ color: "var(--ash)", fontSize: 11.5 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 22, fontFamily: "var(--font-mono)", color, letterSpacing: "-0.01em" }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 4, fontSize: 11, color: "var(--ash-dim)" }}>{sub}</div>}
    </div>
  );
}
