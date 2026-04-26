"use client";

import React from "react";
import { demoInvoices } from "@/lib/demo/seed";
import { DemoToast, useDemoToast } from "@/components/demo/DemoToast";

interface ChartBar { label: string; paid: number; outstanding: number; }

const monthlyData: ChartBar[] = [
  { label: "Nov", paid: 0, outstanding: 0 },
  { label: "Dec", paid: 0, outstanding: 0 },
  { label: "Jan", paid: 0, outstanding: 0 },
  { label: "Feb", paid: 1100, outstanding: 0 },
  { label: "Mar", paid: 0, outstanding: 4250 },
  { label: "Apr", paid: 2890, outstanding: 1750 },
];

const weeklyData: ChartBar[] = [
  { label: "Mon 20", paid: 0, outstanding: 0 },
  { label: "Tue 21", paid: 0, outstanding: 0 },
  { label: "Wed 22", paid: 0, outstanding: 0 },
  { label: "Thu 23", paid: 0, outstanding: 0 },
  { label: "Fri 24", paid: 0, outstanding: 0 },
  { label: "Sat 25", paid: 0, outstanding: 4250 },
  { label: "Sun 26", paid: 2890, outstanding: 1750 },
];

export default function DemoCashflowPage() {
  const { visible, hide } = useDemoToast();
  const [period, setPeriod] = React.useState<"7d" | "30d" | "6m">("30d");

  const formatAUD = (n: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

  const paidTotal = demoInvoices.filter((i) => i.status === "paid").reduce((a, i) => a + i.total, 0);
  const outstandingTotal = demoInvoices.filter((i) => ["sent", "overdue"].includes(i.status)).reduce((a, i) => a + i.total, 0);

  const data = period === "7d" ? weeklyData : monthlyData;
  const maxVal = Math.max(...data.map((d) => d.paid + d.outstanding), 1);

  return (
    <div>
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
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>Cashflow</h1>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", padding: 3, borderRadius: 8, border: "1px solid var(--hair)" }}>
          {(["7d", "30d", "6m"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                borderRadius: 5,
                color: period === p ? "var(--warm-white)" : "var(--ash)",
                background: period === p ? "rgba(255,255,255,0.06)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                letterSpacing: 0.3,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 24, animation: "rl-fade-up 400ms var(--ease-out)" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total collected", value: formatAUD(paidTotal), tone: "#9fd3aa", sub: "2 paid invoices" },
            { label: "Outstanding", value: formatAUD(outstandingTotal), tone: "#f0ce93", sub: "2 open invoices" },
            { label: "Overdue", value: formatAUD(4250), tone: "#ff7468", sub: "1 invoice · 15d late" },
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
              <div style={{ fontSize: 26, fontFamily: "var(--font-mono)", fontWeight: 500, letterSpacing: "-0.02em", color: s.tone, marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ash-dim)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div
          style={{
            background: "linear-gradient(180deg,rgba(22,24,31,0.9) 0%,rgba(12,13,17,0.9) 100%)",
            border: "1px solid var(--hair)",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>
              Paid vs outstanding · {period}
            </span>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--ash)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(126,192,138,0.5)", border: "1px solid rgba(126,192,138,0.4)" }} />
                Paid
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,75,62,0.3)", border: "1px solid rgba(255,75,62,0.3)" }} />
                Outstanding
              </span>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ash)", marginBottom: 24 }}>
            Demo data for illustration — your real cashflow appears once you sign up.
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: period === "7d" ? 20 : 28, height: 200, padding: "0 4px" }}>
            {data.map((d, i) => {
              const paidH = (d.paid / maxVal) * 160;
              const outH = (d.outstanding / maxVal) * 160;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 3 }}>
                    {outH > 0 && (
                      <div
                        style={{
                          height: outH,
                          background: "linear-gradient(180deg,rgba(255,75,62,0.4),rgba(255,75,62,0.15))",
                          border: "1px solid rgba(255,75,62,0.3)",
                          borderRadius: "4px 4px 0 0",
                          animation: `rl-fade-up 500ms var(--ease-out) ${i * 60}ms both`,
                        }}
                      />
                    )}
                    {paidH > 0 && (
                      <div
                        style={{
                          height: paidH,
                          background: "linear-gradient(180deg,rgba(126,192,138,0.5),rgba(126,192,138,0.2))",
                          border: "1px solid rgba(126,192,138,0.3)",
                          borderRadius: "4px 4px 0 0",
                          animation: `rl-fade-up 500ms var(--ease-out) ${i * 60 + 80}ms both`,
                        }}
                      />
                    )}
                    {paidH === 0 && outH === 0 && (
                      <div style={{ height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2 }} />
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0, textAlign: "center", lineHeight: 1.2 }}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice breakdown */}
        <div
          style={{
            marginTop: 20,
            background: "linear-gradient(180deg,rgba(22,24,31,0.9) 0%,rgba(12,13,17,0.9) 100%)",
            border: "1px solid var(--hair)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--hair)", fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>
            Invoice breakdown
          </div>
          {demoInvoices
            .filter((i) => i.status !== "draft")
            .map((inv, i, arr) => (
              <div
                key={inv.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1fr 1fr",
                  gap: 14,
                  padding: "12px 20px",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  fontSize: 13,
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ash-dim)", letterSpacing: 0.3 }}>{inv.invoiceNumber}</span>
                <span style={{ color: "var(--warm-white-dim)" }}>{inv.clientName}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: inv.status === "overdue" ? "#ff7468" : inv.status === "paid" ? "#9fd3aa" : "#f0ce93" }}>
                  {formatAUD(inv.total)}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: inv.status === "overdue" ? "#ff7468" : inv.status === "paid" ? "#9fd3aa" : "#f0ce93",
                    textTransform: "capitalize",
                  }}
                >
                  {inv.status}
                </span>
              </div>
            ))}
        </div>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}
