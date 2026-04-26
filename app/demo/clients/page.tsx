"use client";

import React from "react";
import { demoClients, demoInvoices } from "@/lib/demo/seed";
import { DemoToast, useDemoToast } from "@/components/demo/DemoToast";

const Icon = {
  plus: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  user: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  chev: ({ s = 14, dir = "right" }: { s?: number; dir?: "right" | "left" | "down" | "up" }) => {
    const rot = { down: 0, up: 180, left: 90, right: -90 }[dir];
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  },
};

export default function DemoClientsPage() {
  const { visible, fire, hide } = useDemoToast();

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
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>Clients</h1>
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
          New client
        </button>
      </div>

      <div style={{ padding: 24, animation: "rl-fade-up 400ms var(--ease-out)" }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total clients", value: demoClients.length.toString(), sub: "active accounts" },
            {
              label: "Total billed",
              value: formatAUD(demoClients.reduce((a, c) => a + c.totalBilled, 0)),
              sub: "across all clients",
            },
            {
              label: "Outstanding",
              value: formatAUD(demoClients.reduce((a, c) => a + c.totalOutstanding, 0)),
              sub: "awaiting payment",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: 18,
                border: "1px solid var(--hair)",
                borderRadius: 12,
                background: "linear-gradient(180deg,rgba(22,24,31,0.5),rgba(12,13,17,0.5))",
              }}
            >
              <div style={{ fontSize: 11.5, color: "var(--ash)", marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontFamily: "var(--font-mono)", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: "var(--ash-dim)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Client cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demoClients.map((client) => {
            const clientInvoices = demoInvoices.filter((i) => i.clientId === client.id);
            const overdueCount = clientInvoices.filter((i) => i.status === "overdue").length;
            return (
              <div
                key={client.id}
                style={{
                  background: "linear-gradient(180deg,rgba(22,24,31,0.9) 0%,rgba(12,13,17,0.9) 100%)",
                  border: `1px solid ${overdueCount > 0 ? "rgba(255,75,62,0.2)" : "var(--hair)"}`,
                  borderRadius: 12,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  transition: "background 160ms",
                  cursor: "default",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "linear-gradient(180deg,rgba(28,30,40,0.9) 0%,rgba(16,17,22,0.9) 100%)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "linear-gradient(180deg,rgba(22,24,31,0.9) 0%,rgba(12,13,17,0.9) 100%)")}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,rgba(255,75,62,0.2),rgba(255,75,62,0.06))",
                    border: "1px solid rgba(255,75,62,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ff7468",
                    flexShrink: 0,
                  }}
                >
                  <Icon.user s={18} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 4 }}>{client.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ash)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
                    {client.email}
                    {client.phone && <span style={{ marginLeft: 14, color: "var(--ash-dim)" }}>{client.phone}</span>}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 32, flexShrink: 0 }}>
                  {[
                    { label: "Invoices", value: client.invoiceCount.toString() },
                    { label: "Total billed", value: formatAUD(client.totalBilled) },
                    {
                      label: "Outstanding",
                      value: formatAUD(client.totalOutstanding),
                      highlight: client.totalOutstanding > 0,
                    },
                    { label: "Last invoice", value: formatDate(client.lastInvoiceAt) },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "var(--ash-dim)", marginBottom: 4, letterSpacing: "-0.005em" }}>{s.label}</div>
                      <div
                        style={{
                          fontSize: 14,
                          fontFamily: s.label === "Invoices" ? undefined : "var(--font-mono)",
                          color: s.highlight ? "#f0ce93" : "var(--warm-white-dim)",
                          letterSpacing: s.label === "Invoices" ? undefined : "-0.01em",
                        }}
                      >
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action */}
                <button
                  onClick={fire}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    height: 30,
                    padding: "0 10px",
                    fontSize: 12,
                    color: "var(--ash)",
                    background: "transparent",
                    border: "1px solid var(--hair)",
                    borderRadius: 7,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  View <Icon.chev s={12} dir="right" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}
