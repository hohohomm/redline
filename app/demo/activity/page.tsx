"use client";

import React from "react";
import Link from "next/link";
import { demoActivity, type DemoActivityEvent } from "@/lib/demo/seed";
import { DemoToast, useDemoToast } from "@/components/demo/DemoToast";

const eventConfig: Record<DemoActivityEvent["type"], { dot: string; dotColor: string; dotBg: string; dotBorder: string; label: string }> = {
  invoice_sent: { dot: "→", dotColor: "#6ba6ff", dotBg: "rgba(107,166,255,0.12)", dotBorder: "rgba(107,166,255,0.25)", label: "Invoice sent" },
  invoice_opened: { dot: "👁", dotColor: "#6ba6ff", dotBg: "rgba(107,166,255,0.08)", dotBorder: "rgba(107,166,255,0.2)", label: "Invoice opened" },
  reminder_sent: { dot: "!", dotColor: "#ff7468", dotBg: "rgba(255,75,62,0.1)", dotBorder: "rgba(255,75,62,0.25)", label: "Reminder sent" },
  marked_paid: { dot: "✓", dotColor: "#9fd3aa", dotBg: "rgba(126,192,138,0.12)", dotBorder: "rgba(126,192,138,0.25)", label: "Marked paid" },
  invoice_created: { dot: "+", dotColor: "var(--ash)", dotBg: "rgba(255,255,255,0.04)", dotBorder: "var(--hair)", label: "Invoice created" },
  payment_received: { dot: "$", dotColor: "#9fd3aa", dotBg: "rgba(126,192,138,0.12)", dotBorder: "rgba(126,192,138,0.25)", label: "Payment received" },
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
    + " · "
    + d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
};

export default function DemoActivityPage() {
  const { visible, fire, hide } = useDemoToast();

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
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>Activity</h1>
        <button
          onClick={fire}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 30,
            padding: "0 12px",
            fontSize: 12.5,
            color: "var(--ash)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--hair)",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Export
        </button>
      </div>

      <div style={{ padding: 24, maxWidth: 800, animation: "rl-fade-up 400ms var(--ease-out)" }}>
        {/* Feed */}
        <div
          style={{
            background: "linear-gradient(180deg,rgba(22,24,31,0.9) 0%,rgba(12,13,17,0.9) 100%)",
            border: "1px solid var(--hair)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>All events</span>
            <span style={{ fontSize: 12, color: "var(--ash-dim)", fontFamily: "var(--font-mono)" }}>{demoActivity.length} events</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {demoActivity.map((evt, i) => {
              const cfg = eventConfig[evt.type];
              return (
                <div
                  key={evt.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "16px 20px",
                    borderBottom: i < demoActivity.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "flex-start",
                    transition: "background 140ms",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.015)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 14,
                      background: cfg.dotBg,
                      color: cfg.dotColor,
                      border: `1px solid ${cfg.dotBorder}`,
                    }}
                  >
                    {cfg.dot}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: "var(--warm-white-dim)", lineHeight: 1.45, letterSpacing: "-0.005em" }}>
                      {evt.description}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 11.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)" }}>
                        {formatDateTime(evt.at)}
                      </span>
                      <Link
                        href={`/demo/invoices/${evt.invoiceId}`}
                        style={{
                          fontSize: 11.5,
                          color: "var(--ash)",
                          fontFamily: "var(--font-mono)",
                          textDecoration: "none",
                          letterSpacing: 0.3,
                        }}
                      >
                        {evt.invoiceNumber}
                      </Link>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--ash-dim)",
                          display: "inline-flex",
                          alignItems: "center",
                          height: 18,
                          padding: "0 7px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--hair)",
                          borderRadius: 999,
                        }}
                      >
                        {evt.clientName}
                      </span>
                    </div>
                  </div>

                  {/* Type badge */}
                  <span
                    style={{
                      fontSize: 11,
                      color: cfg.dotColor,
                      display: "inline-flex",
                      alignItems: "center",
                      height: 20,
                      padding: "0 8px",
                      background: cfg.dotBg,
                      border: `1px solid ${cfg.dotBorder}`,
                      borderRadius: 999,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}
