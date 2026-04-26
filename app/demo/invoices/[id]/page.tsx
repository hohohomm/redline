"use client";

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { demoInvoices } from "@/lib/demo/seed";
import { DemoToast, useDemoToast } from "@/components/demo/DemoToast";

const Icon = {
  chev: ({ s = 14, dir = "down" }: { s?: number; dir?: "down" | "up" | "left" | "right" }) => {
    const rot = { down: 0, up: 180, left: 90, right: -90 }[dir];
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  },
  send: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="m22 2-11 11M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  check: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  edit: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  download: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  copy: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  trash: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

const Btn = ({
  children,
  variant = "secondary",
  icon,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  const v = {
    primary: { bg: "linear-gradient(180deg,#ff4b3e 0%,#d8352a 100%)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
    secondary: { bg: "rgba(255,255,255,0.03)", color: "var(--warm-white)", border: "1px solid var(--hair-strong)" },
    ghost: { bg: "transparent", color: "var(--ash)", border: "1px solid var(--hair)" },
    danger: { bg: "rgba(155,28,31,0.12)", color: "#ff9089", border: "1px solid rgba(255,75,62,0.2)" },
  }[variant];

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 38,
        padding: "0 14px",
        fontSize: 13.5,
        fontWeight: 450,
        borderRadius: 9,
        cursor: "pointer",
        background: v.bg,
        color: v.color,
        border: v.border,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        transition: "opacity 160ms",
      }}
    >
      {icon}
      {children}
    </button>
  );
};

// ─── Timeline events from activity seed ──────────────────────────────────────

const invoiceTimelines: Record<string, Array<{ dot: "sent" | "open" | "warn" | "pending"; label: string; detail: string; when: string; pending?: boolean }>> = {
  "inv-1024": [
    { dot: "sent", label: "Invoice sent", detail: "to james@acmecorp.com", when: "28 Mar 2026 · 9:02 AM" },
    { dot: "open", label: "Invoice opened", detail: "by client", when: "28 Mar 2026 · 11:47 AM" },
    { dot: "warn", label: "Reminder 1 sent", detail: "— Friendly nudge", when: "14 Apr 2026 · 8:00 AM" },
    { dot: "warn", label: "Reminder 2 sent", detail: "— Overdue notice", when: "18 Apr 2026 · 8:00 AM" },
    { dot: "pending", label: "Reminder 3 scheduled", detail: "— Late fee notice", when: "25 Apr 2026 · 8:00 AM", pending: true },
  ],
  "inv-1025": [
    { dot: "sent", label: "Invoice sent", detail: "to bob@bobsplumbing.com.au", when: "10 Apr 2026 · 10:22 AM" },
    { dot: "open", label: "Invoice opened", detail: "by client", when: "10 Apr 2026 · 2:05 PM" },
    { dot: "pending", label: "Reminder 1 scheduled", detail: "— Friendly nudge", when: "Queued · 7d after due", pending: true },
  ],
  "inv-1026": [
    { dot: "sent", label: "Invoice sent", detail: "to hello@tidestudio.co", when: "20 Mar 2026 · 9:00 AM" },
    { dot: "open", label: "Invoice opened", detail: "by client", when: "20 Mar 2026 · 11:30 AM" },
    { dot: "open", label: "Payment received", detail: "A$2,890.00", when: "1 Apr 2026 · 11:30 AM" },
  ],
  "inv-1027": [
    { dot: "sent", label: "Invoice sent", detail: "to hello@tidestudio.co", when: "14 Feb 2026 · 9:00 AM" },
    { dot: "open", label: "Payment received", detail: "A$1,100.00", when: "25 Feb 2026 · 4:00 PM" },
  ],
  "inv-1028": [
    { dot: "sent", label: "Invoice created", detail: "saved as draft", when: "22 Apr 2026 · 9:14 AM" },
  ],
};

export default function DemoInvoiceDetailPage({ params }: { params: { id: string } }) {
  const { visible, fire, hide } = useDemoToast();
  const invoice = demoInvoices.find((i) => i.id === params.id);
  if (!invoice) notFound();

  const timeline = invoiceTimelines[invoice.id] ?? [];

  const formatAUD = (n: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 2 }).format(n);

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

  const daysSinceDue = (() => {
    if (invoice.status !== "overdue") return 0;
    const due = new Date(`${invoice.dueDate}T00:00:00`);
    const now = new Date("2026-04-26T00:00:00"); // demo "today"
    return Math.ceil((now.getTime() - due.getTime()) / 86400000);
  })();

  const statusConfig = {
    overdue: { bg: "rgba(255,75,62,0.15)", color: "#ff4b3e", border: "rgba(255,75,62,0.3)", label: `● Overdue` },
    sent: { bg: "rgba(107,166,255,0.12)", color: "#6ba6ff", border: "rgba(107,166,255,0.25)", label: "● Sent" },
    paid: { bg: "rgba(46,194,126,0.12)", color: "#2ec27e", border: "rgba(46,194,126,0.25)", label: "● Paid" },
    draft: { bg: "rgba(166,162,160,0.1)", color: "var(--ash)", border: "var(--hair)", label: "● Draft" },
  }[invoice.status];

  const dotClass = {
    sent: { bg: "rgba(107,166,255,0.12)", color: "#6ba6ff" },
    open: { bg: "rgba(46,194,126,0.1)", color: "#2ec27e" },
    warn: { bg: "rgba(255,75,62,0.1)", color: "#ff4b3e" },
    pending: { bg: "transparent", color: "var(--ash-dim)" },
  };

  const dotLabel = { sent: "→", open: "👁", warn: "!", pending: "⏳" };

  return (
    <div>
      {/* Ambient */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: "radial-gradient(circle,rgba(255,75,62,0.05) 0%,transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

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
          background: "rgba(8,9,11,0.88)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/demo/invoices" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ash)", textDecoration: "none" }}>
            <Icon.chev s={13} dir="left" />
            Invoices
          </Link>
          <span style={{ color: "var(--ash-deep)", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: "var(--warm-white-dim)" }}>{invoice.invoiceNumber}</span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", padding: "36px 32px 80px" }}>
        {/* Invoice header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: "-0.035em" }}>{invoice.invoiceNumber}</h1>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  background: statusConfig.bg,
                  color: statusConfig.color,
                  border: `1px solid ${statusConfig.border}`,
                }}
              >
                {statusConfig.label}
              </span>
            </div>
            <div style={{ fontSize: 15, color: "var(--ash)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span>{invoice.clientName}</span>
              <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
              <span>
                Due {formatDate(invoice.dueDate)}
                {invoice.status === "overdue" && (
                  <span style={{ color: "#ff4b3e" }}> ({daysSinceDue} days ago)</span>
                )}
              </span>
              {invoice.reminderStage > 0 && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
                  <span>{invoice.reminderStage} reminder{invoice.reminderStage !== 1 ? "s" : ""} sent</span>
                </>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ fontSize: 18, color: "var(--ash)", marginRight: 4 }}>AUD</span>
              {formatAUD(invoice.total)}
            </div>
            <div style={{ fontSize: 13, color: "var(--ash-dim)", marginTop: 4 }}>Total outstanding</div>
          </div>
        </div>

        {/* Overdue notice */}
        {invoice.status === "overdue" && (
          <div
            style={{
              background: "rgba(255,75,62,0.06)",
              border: "1px solid rgba(255,75,62,0.2)",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 24,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span style={{ color: "#ff4b3e", fontSize: 18, flexShrink: 0 }}>⚠</span>
            <div style={{ fontSize: 14, color: "var(--warm-white-dim)" }}>
              <strong style={{ color: "#ff4b3e" }}>{daysSinceDue} days overdue.</strong>{" "}
              {invoice.reminderStage} automated reminder{invoice.reminderStage !== 1 ? "s" : ""} sent. Consider a manual nudge or escalation.
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
          <Btn variant="primary" icon={<Icon.send s={13} />} onClick={fire}>Send manual nudge</Btn>
          <Btn variant="secondary" icon={<Icon.check s={13} />} onClick={fire}>Mark paid</Btn>
          <Btn variant="ghost" icon={<Icon.edit s={13} />} onClick={fire}>Edit</Btn>
          <Btn variant="ghost" icon={<Icon.download s={13} />} onClick={fire}>Download PDF</Btn>
          <Btn variant="ghost" icon={<Icon.copy s={13} />} onClick={fire}>Copy pay link</Btn>
          <Btn variant="danger" icon={<Icon.trash s={13} />} onClick={fire}>Delete</Btn>
        </div>

        {/* Two-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Line items */}
            <div style={{ background: "var(--graphite-700)", border: "1px solid var(--hair)", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ash)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>
                Line items
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 12, color: "var(--ash-dim)", fontWeight: 500, textAlign: "left", padding: "0 0 12px", borderBottom: "1px solid var(--hair)", width: "50%" }}>Description</th>
                    <th style={{ fontSize: 12, color: "var(--ash-dim)", fontWeight: 500, textAlign: "left", padding: "0 0 12px", borderBottom: "1px solid var(--hair)" }}>Qty</th>
                    <th style={{ fontSize: 12, color: "var(--ash-dim)", fontWeight: 500, textAlign: "left", padding: "0 0 12px", borderBottom: "1px solid var(--hair)" }}>Unit price</th>
                    <th style={{ fontSize: 12, color: "var(--ash-dim)", fontWeight: 500, textAlign: "right", padding: "0 0 12px", borderBottom: "1px solid var(--hair)" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line, i) => (
                    <tr key={i}>
                      <td style={{ padding: "14px 0", borderBottom: "1px solid var(--hair)", fontSize: 14, color: "var(--warm-white-dim)", verticalAlign: "top" }}>
                        <span style={{ color: "var(--warm-white)" }}>{line.description}</span>
                        {line.note && <br />}
                        {line.note && <span style={{ fontSize: 12, color: "var(--ash-dim)" }}>{line.note}</span>}
                      </td>
                      <td style={{ padding: "14px 0", borderBottom: "1px solid var(--hair)", fontSize: 14, color: "var(--warm-white-dim)", verticalAlign: "top" }}>{line.qty}</td>
                      <td style={{ padding: "14px 0", borderBottom: "1px solid var(--hair)", fontSize: 14, color: "var(--warm-white-dim)", verticalAlign: "top" }}>{formatAUD(line.unitPrice)}</td>
                      <td style={{ padding: "14px 0", borderBottom: "1px solid var(--hair)", fontSize: 14, color: "var(--warm-white-dim)", verticalAlign: "top", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {formatAUD(line.qty * line.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, color: "var(--ash)" }}>
                  <span>Subtotal</span><span>{formatAUD(invoice.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, color: "var(--ash)" }}>
                  <span>GST (10%)</span><span>{formatAUD(invoice.gst)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 6px", fontSize: 17, fontWeight: 600, color: "var(--warm-white)", borderTop: "1px solid var(--hair)", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
                  <span>Total AUD</span><span>{formatAUD(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment history */}
            <div style={{ background: "var(--graphite-700)", border: "1px solid var(--hair)", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ash)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
                Payment history
              </div>
              {invoice.status === "paid" ? (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 14 }}>
                  <span style={{ color: "#9fd3aa" }}>✓ Payment received</span>
                  <span style={{ color: "var(--warm-white)", fontVariantNumeric: "tabular-nums" }}>{formatAUD(invoice.total)}</span>
                </div>
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "var(--ash-dim)", fontSize: 14, border: "1px dashed var(--hair)", borderRadius: 10 }}>
                  No payments received yet.
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Activity timeline */}
            <div style={{ background: "var(--graphite-700)", border: "1px solid var(--hair)", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ash)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
                Activity timeline
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {timeline.map((evt, i) => {
                  const dc = dotClass[evt.dot];
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: "14px 0",
                        position: "relative",
                        opacity: evt.pending ? 0.45 : 1,
                      }}
                    >
                      {/* connector line */}
                      {i < timeline.length - 1 && (
                        <div style={{ position: "absolute", left: 13, top: 38, width: 1, height: "calc(100% - 12px)", background: "var(--hair)" }} />
                      )}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 13,
                          marginTop: 1,
                          border: evt.pending ? "1px dashed var(--hair-strong)" : "1px solid var(--hair)",
                          background: dc.bg,
                          color: dc.color,
                        }}
                      >
                        {dotLabel[evt.dot]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: "var(--warm-white-dim)", lineHeight: 1.4 }}>
                          <strong style={{ color: "var(--warm-white)", fontWeight: 500 }}>{evt.label}</strong> {evt.detail}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ash-dim)", marginTop: 3 }}>{evt.when}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoice info */}
            <div style={{ background: "var(--graphite-700)", border: "1px solid var(--hair)", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ash)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
                Invoice info
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Client", invoice.clientName],
                  ["Contact", invoice.clientEmail],
                  ["Issued", formatDate(invoice.issuedAt)],
                  ["Due date", formatDate(invoice.dueDate)],
                  ["Payment terms", invoice.paymentTerms],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--ash)" }}>{label}</span>
                    <span style={{ color: invoice.status === "overdue" && label === "Due date" ? "#ff4b3e" : "var(--warm-white-dim)" }}>{val}</span>
                  </div>
                ))}
                <hr style={{ border: "none", borderTop: "1px solid var(--hair)", margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--ash)" }}>Sequence</span>
                  <span style={{ color: "#6ba6ff" }}>Auto reminders on</span>
                </div>
                {invoice.lateFee && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--ash)" }}>Late fee</span>
                    <span style={{ color: "var(--warm-white-dim)" }}>{invoice.lateFee}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}
