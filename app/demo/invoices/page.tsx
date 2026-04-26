"use client";

import React from "react";
import Link from "next/link";
import { demoInvoices, type DemoStatus } from "@/lib/demo/seed";
import { DemoToast, useDemoToast } from "@/components/demo/DemoToast";

const Icon = {
  plus: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  filter: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  check: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const statusChip = (status: DemoStatus) => {
  const configs = {
    paid: { bg: "rgba(126,192,138,0.1)", color: "#9fd3aa", border: "rgba(126,192,138,0.25)", label: "Paid" },
    overdue: { bg: "rgba(255,75,62,0.1)", color: "#ff7468", border: "rgba(255,75,62,0.25)", label: "Overdue" },
    sent: { bg: "rgba(232,192,124,0.1)", color: "#f0ce93", border: "rgba(232,192,124,0.25)", label: "Sent" },
    draft: { bg: "rgba(255,255,255,0.04)", color: "var(--ash)", border: "var(--hair)", label: "Draft" },
  };
  const c = configs[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        padding: "0 9px",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {status === "paid" && <Icon.check s={9} />}
      &nbsp;{c.label}
    </span>
  );
};

export default function DemoInvoicesPage() {
  const { visible, fire, hide } = useDemoToast();
  const [filter, setFilter] = React.useState<"all" | DemoStatus>("all");

  const filtered = filter === "all" ? demoInvoices : demoInvoices.filter((i) => i.status === filter);

  const formatAUD = (n: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });

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
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>Invoices</h1>
        <div style={{ display: "flex", gap: 8 }}>
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
            }}
          >
            <Icon.filter s={12} />
            Filter
          </button>
          <button
            onClick={fire}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 30,
              padding: "0 12px",
              fontSize: 12.5,
              fontWeight: 500,
              background: "linear-gradient(180deg,#ff4b3e 0%,#d8352a 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <Icon.plus s={12} />
            New invoice
          </button>
        </div>
      </div>

      <div style={{ padding: 24, animation: "rl-fade-up 400ms var(--ease-out)" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 10, border: "1px solid var(--hair)", width: "fit-content", marginBottom: 20 }}>
          {(["all", "overdue", "sent", "paid", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                fontSize: 12.5,
                borderRadius: 7,
                color: filter === f ? "var(--warm-white)" : "var(--ash)",
                background: filter === f ? "rgba(255,255,255,0.06)" : "transparent",
                textTransform: "capitalize",
                letterSpacing: "-0.005em",
                border: "none",
                cursor: "pointer",
                transition: "all 160ms",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            background: "linear-gradient(180deg,rgba(22,24,31,0.9) 0%,rgba(12,13,17,0.9) 100%)",
            border: "1px solid var(--hair)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1.4fr 1fr 1fr 1fr 1fr",
              gap: 14,
              padding: "10px 20px",
              fontSize: 10.5,
              color: "var(--ash-dim)",
              fontFamily: "var(--font-mono)",
              letterSpacing: 0.5,
              borderBottom: "1px solid var(--hair)",
            }}
          >
            <span>NUMBER</span>
            <span>CLIENT</span>
            <span>AMOUNT</span>
            <span>STATUS</span>
            <span>DUE DATE</span>
            <span>STAGE</span>
          </div>

          {filtered.map((inv, i) => (
            <Link
              key={inv.id}
              href={`/demo/invoices/${inv.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1.4fr 1fr 1fr 1fr 1fr",
                gap: 14,
                padding: "14px 20px",
                borderBottom: i === filtered.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)",
                fontSize: 13,
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                transition: "background 140ms",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.015)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ash-dim)", letterSpacing: 0.3 }}>
                {inv.invoiceNumber}
              </span>
              <div>
                <div style={{ letterSpacing: "-0.005em", marginBottom: 2 }}>{inv.clientName}</div>
                <div style={{ fontSize: 11, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>{inv.clientEmail}</div>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "-0.01em" }}>
                {formatAUD(inv.total)}
              </span>
              <span>{statusChip(inv.status)}</span>
              <span style={{ fontSize: 12.5, color: inv.status === "overdue" ? "#ff7468" : "var(--warm-white-dim)", letterSpacing: "-0.005em" }}>
                {formatDate(inv.dueDate)}
              </span>
              <span style={{ fontSize: 12, color: "var(--ash)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
                {inv.status === "paid" ? "Paid" : inv.status === "draft" ? "—" : `Stage ${inv.reminderStage}`}
              </span>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ash)", fontSize: 13 }}>
              No invoices in this filter.
            </div>
          )}
        </div>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}
