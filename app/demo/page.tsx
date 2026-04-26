"use client";

import React from "react";
import Link from "next/link";
import { demoInvoices, demoStats, demoActivity } from "@/lib/demo/seed";
import { DemoToast, useDemoToast } from "@/components/demo/DemoToast";

// ─── Shared micro-components ─────────────────────────────────────────────────

const Icon = {
  search: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  bell: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 3h16l-2-3ZM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  check: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const Chip = ({
  children,
  tone = "neutral",
  icon,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "red" | "ok" | "amber" | "dark";
  icon?: React.ReactNode;
}) => {
  const tones = {
    neutral: { bg: "rgba(255,255,255,0.04)", color: "var(--ash)", border: "var(--hair)" },
    red: { bg: "rgba(255,75,62,0.1)", color: "#ff7468", border: "rgba(255,75,62,0.25)" },
    ok: { bg: "rgba(126,192,138,0.1)", color: "#9fd3aa", border: "rgba(126,192,138,0.25)" },
    amber: { bg: "rgba(232,192,124,0.1)", color: "#f0ce93", border: "rgba(232,192,124,0.25)" },
    dark: { bg: "rgba(8,9,11,0.6)", color: "var(--warm-white-dim)", border: "var(--hair)" },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 24,
        padding: "0 9px",
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {children}
    </span>
  );
};

const StatTile = ({
  label,
  value,
  delta,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "ok" | "red" | "amber" | "neutral";
  sub?: string;
}) => {
  const toneColor = { ok: "#9fd3aa", red: "#ff7468", amber: "#f0ce93", neutral: "var(--ash)" };
  return (
    <div
      style={{
        padding: 18,
        border: "1px solid var(--hair)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(22,24,31,0.5), rgba(12,13,17,0.5))",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: "var(--ash)", letterSpacing: "-0.005em" }}>{label}</span>
        {delta && <span style={{ fontSize: 11, color: toneColor[tone], fontFamily: "var(--font-mono)" }}>{delta}</span>}
      </div>
      <div style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 500, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--ash-dim)" }}>{sub}</div>}
    </div>
  );
};

const statusChip = (status: string) => {
  if (status === "paid") return <Chip tone="ok" icon={<Icon.check s={10} />}>Paid</Chip>;
  if (status === "overdue") return <Chip tone="red">Overdue</Chip>;
  if (status === "sent") return <Chip tone="amber">Sent</Chip>;
  return <Chip tone="neutral">Draft</Chip>;
};

const activityIcon = (type: string) => {
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: "50%",
    flexShrink: 0,
    fontSize: 13,
  };
  if (type === "marked_paid" || type === "payment_received")
    return <div style={{ ...base, background: "rgba(126,192,138,0.12)", color: "#9fd3aa", border: "1px solid rgba(126,192,138,0.25)" }}>✓</div>;
  if (type === "reminder_sent")
    return <div style={{ ...base, background: "rgba(255,75,62,0.1)", color: "#ff7468", border: "1px solid rgba(255,75,62,0.25)" }}>!</div>;
  if (type === "invoice_opened")
    return <div style={{ ...base, background: "rgba(107,166,255,0.1)", color: "#6ba6ff", border: "1px solid rgba(107,166,255,0.25)" }}>👁</div>;
  return <div style={{ ...base, background: "rgba(107,166,255,0.1)", color: "#6ba6ff", border: "1px solid rgba(107,166,255,0.25)" }}>→</div>;
};

// ─── Demo home page ──────────────────────────────────────────────────────────

export default function DemoPage() {
  const { visible, fire, hide } = useDemoToast();
  const [filter, setFilter] = React.useState("all");

  const recentInvoices = demoInvoices.slice(0, 5);
  const filtered = filter === "all" ? recentInvoices : recentInvoices.filter((i) => i.status === filter);
  const recentActivity = demoActivity.slice(0, 5);

  const formatAUD = (n: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { month: "short", day: "numeric" });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString("en-AU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid var(--hair)",
          position: "sticky",
          top: 37,
          background: "rgba(8,9,11,0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>Overview</h1>
          <Chip tone="dark">April 2026</Chip>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            onClick={fire}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--hair)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--ash)",
              minWidth: 260,
              cursor: "pointer",
            }}
          >
            <Icon.search s={13} />
            <span style={{ flex: 1 }}>Search invoices, clients…</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 18,
                height: 18,
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--ash)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--hair)",
                borderRadius: 4,
              }}
            >
              ⌘K
            </span>
          </div>
          <button
            onClick={fire}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 30,
              padding: "0 12px",
              fontSize: 12.5,
              background: "rgba(255,255,255,0.03)",
              color: "var(--warm-white)",
              border: "1px solid var(--hair)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <Icon.bell s={13} />
            Activity
          </button>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, animation: "rl-fade-up 400ms var(--ease-out)" }}>
        {/* Rei greeting */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "14px 18px",
            background: "linear-gradient(90deg, rgba(255,75,62,0.08) 0%, rgba(22,24,31,0.3) 60%)",
            border: "1px solid rgba(255,75,62,0.15)",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <div
            aria-label="Rei"
            role="img"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#0c0d11",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 1.5px #ff4b3e, 0 0 14px rgba(255,75,62,0.45)",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: 15,
              fontWeight: 600,
              color: "#ff6a5a",
              letterSpacing: "-0.04em",
              textShadow: "0 0 8px rgba(255,75,62,0.6)",
            }}
          >
            R
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "var(--warm-white)", letterSpacing: "-0.01em", marginBottom: 2 }}>
              Morning.{" "}
              <span style={{ color: "var(--ash)" }}>
                1 overdue invoice (INV-1024, Acme Corp — 15 days). Friendly reminder 2 already sent. Stage 3 queued for next cron.
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
              rei · live
            </div>
          </div>
          <button
            onClick={fire}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 30,
              padding: "0 12px",
              fontSize: 12.5,
              fontWeight: 450,
              background: "rgba(255,255,255,0.03)",
              color: "var(--warm-white)",
              border: "1px solid var(--hair)",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Review queue
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="stat-grid">
          <StatTile label="Outstanding" value={formatAUD(demoStats.outstanding)} sub={`across ${demoStats.outstandingCount} invoices`} delta="open" tone="amber" />
          <StatTile label="Overdue" value={formatAUD(demoStats.overdue)} sub={`${demoStats.overdueCount} client`} delta="needs action" tone="red" />
          <StatTile label="Paid · Apr" value={formatAUD(demoStats.paidThisMonth)} sub={`${demoStats.paidThisMonthCount} invoice`} delta="paid" tone="ok" />
          <StatTile label="Avg. days to pay" value={`${demoStats.avgDaysToPay}`} sub="2 paid invoices" delta="live" tone="ok" />
        </div>

        {/* Two col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }} className="dash-grid">
          {/* Invoices table */}
          <div
            style={{
              background: "linear-gradient(180deg, rgba(22,24,31,0.9) 0%, rgba(12,13,17,0.9) 100%)",
              border: "1px solid var(--hair)",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "var(--shadow-panel)",
            }}
          >
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>Invoices</div>
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", padding: 3, borderRadius: 8, border: "1px solid var(--hair)" }}>
                {["all", "overdue", "sent", "paid", "draft"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "5px 10px",
                      fontSize: 11.5,
                      borderRadius: 5,
                      color: filter === f ? "var(--warm-white)" : "var(--ash)",
                      background: filter === f ? "rgba(255,255,255,0.06)" : "transparent",
                      textTransform: "capitalize",
                      letterSpacing: "-0.005em",
                      transition: "all 160ms var(--ease-out)",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1.4fr 1fr 1fr 1fr",
                gap: 14,
                padding: "10px 18px",
                fontSize: 10.5,
                color: "var(--ash-dim)",
                fontFamily: "var(--font-mono)",
                letterSpacing: 0.5,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span>ID</span>
              <span>CLIENT</span>
              <span>AMOUNT</span>
              <span>STATUS</span>
              <span>DUE</span>
            </div>

            {filtered.map((inv, i) => (
              <Link
                key={inv.id}
                href={`/demo/invoices/${inv.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1.4fr 1fr 1fr 1fr",
                  gap: 14,
                  padding: "12px 18px",
                  borderBottom: i === filtered.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)",
                  fontSize: 13,
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background 140ms var(--ease-out)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.015)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)", letterSpacing: 0 }}>
                  {inv.invoiceNumber}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.clientName}</div>
                  <div style={{ fontSize: 11, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.clientEmail}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, letterSpacing: "-0.01em" }}>
                  A${inv.total.toLocaleString()}
                </div>
                <div>{statusChip(inv.status)}</div>
                <div style={{ fontSize: 11.5, color: "var(--ash)", letterSpacing: "-0.005em" }}>
                  {formatDate(inv.dueDate)}
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div style={{ padding: "28px 18px", color: "var(--ash)", fontSize: 13 }}>No invoices found.</div>
            )}
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Cashflow mini */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(22,24,31,0.9) 0%, rgba(12,13,17,0.9) 100%)",
                border: "1px solid var(--hair)",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>Cashflow · 7d</span>
                <Chip tone="ok">A$2,890</Chip>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ash)", marginBottom: 14 }}>Paid vs due, last 7 days.</div>
              {/* Simple bar chart with seed data */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
                {[
                  { day: "Mon", paid: 0, due: 0 },
                  { day: "Tue", paid: 0, due: 0 },
                  { day: "Wed", paid: 2890, due: 0 },
                  { day: "Thu", paid: 0, due: 1750 },
                  { day: "Fri", paid: 0, due: 0 },
                  { day: "Sat", paid: 0, due: 0 },
                  { day: "Sun", paid: 0, due: 4250 },
                ].map((d, i) => {
                  const max = 4250;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2 }}>
                        {d.due > 0 && (
                          <div style={{ height: `${(d.due / max) * 100}%`, background: "linear-gradient(180deg,rgba(255,75,62,0.4),rgba(255,75,62,0.15))", border: "1px solid rgba(255,75,62,0.3)", borderRadius: "4px 4px 0 0" }} />
                        )}
                        {d.paid > 0 && (
                          <div style={{ height: `${(d.paid / max) * 100}%`, background: "linear-gradient(180deg,rgba(126,192,138,0.5),rgba(126,192,138,0.2))", border: "1px solid rgba(126,192,138,0.3)", borderRadius: "4px 4px 0 0" }} />
                        )}
                        {d.paid === 0 && d.due === 0 && (
                          <div style={{ height: "4%", background: "rgba(255,255,255,0.04)", borderRadius: 2 }} />
                        )}
                      </div>
                      <span style={{ fontSize: 9.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)" }}>{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--ash)", paddingTop: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(126,192,138,0.5)", border: "1px solid rgba(126,192,138,0.4)" }} />
                  Paid
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,75,62,0.3)", border: "1px solid rgba(255,75,62,0.3)" }} />
                  Due
                </span>
              </div>
            </div>

            {/* Recent activity */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(22,24,31,0.9) 0%, rgba(12,13,17,0.9) 100%)",
                border: "1px solid var(--hair)",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 14 }}>Recent activity</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {recentActivity.slice(0, 4).map((evt, i) => (
                  <div
                    key={evt.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "flex-start",
                    }}
                  >
                    {activityIcon(evt.type)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "var(--warm-white-dim)", lineHeight: 1.4, letterSpacing: "-0.005em" }}>
                        {evt.description}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {formatDateTime(evt.at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/demo/activity"
                style={{ fontSize: 12, color: "var(--ash)", display: "block", marginTop: 10, textDecoration: "none", letterSpacing: "-0.005em" }}
              >
                View all activity →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}
