import Link from "next/link";

import { DashboardShell } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

type InvoiceRow = {
  id: string;
  client_name: string;
  client_email: string;
  total: number | string | null;
  status: string | null;
  due_date: string | null;
};

type ClientRow = {
  name: string;
  email: string;
  openTotal: number;
  paidTotal: number;
  invoiceCount: number;
  overdueCount: number;
  nextDue: string;
  latestInvoiceId: string;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, status, due_date")
    .order("created_at", { ascending: false });

  const clients = new Map<string, ClientRow>();

  for (const invoice of (data ?? []) as InvoiceRow[]) {
    const email = invoice.client_email || "unknown";
    const existing = clients.get(email);
    const total = Number(invoice.total ?? 0);
    const status = invoice.status ?? "draft";
    const isOpen = status !== "paid" && status !== "void";

    if (!existing) {
      clients.set(email, {
        name: invoice.client_name || "Unnamed client",
        email,
        openTotal: isOpen ? total : 0,
        paidTotal: status === "paid" ? total : 0,
        invoiceCount: 1,
        overdueCount: status === "overdue" ? 1 : 0,
        nextDue: invoice.due_date || "No due date",
        latestInvoiceId: invoice.id,
      });
      continue;
    }

    existing.openTotal += isOpen ? total : 0;
    existing.paidTotal += status === "paid" ? total : 0;
    existing.invoiceCount += 1;
    existing.overdueCount += status === "overdue" ? 1 : 0;

    if (invoice.due_date && (existing.nextDue === "No due date" || invoice.due_date < existing.nextDue)) {
      existing.nextDue = invoice.due_date;
    }
  }

  const clientRows = Array.from(clients.values()).sort((a, b) => b.openTotal - a.openTotal);

  return (
    <DashboardShell route="clients">
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>Clients</h1>
            <p style={{ margin: "8px 0 0", color: "var(--ash)" }}>
              Every client with invoices, open balance, overdue count, and next due date.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a
              href="/api/export/clients"
              style={{ color: "var(--ash)", fontSize: 13, textDecoration: "none" }}
            >
              ↓ Export CSV
            </a>
            <Link href="/dashboard/invoices/new" style={{ color: "#ff7468", fontSize: 13 }}>
              + New invoice
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <Metric label="Clients" value={clientRows.length.toString()} />
          <Metric label="Open balance" value={money.format(clientRows.reduce((sum, client) => sum + client.openTotal, 0))} />
          <Metric label="Overdue clients" value={clientRows.filter((client) => client.overdueCount > 0).length.toString()} />
        </div>

        <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "var(--ash)", textAlign: "left" }}>
              <th style={headCell}>Client</th>
              <th style={headCell}>Open</th>
              <th style={headCell}>Paid</th>
              <th style={headCell}>Invoices</th>
              <th style={headCell}>Overdue</th>
              <th style={headCell}>Next due</th>
            </tr>
          </thead>
          <tbody>
            {clientRows.map((client) => (
              <tr key={client.email}>
                <td style={bodyCell}>
                  <Link
                    href={`/dashboard/clients/${encodeURIComponent(client.email)}`}
                    style={{ color: "var(--warm-white)", textDecoration: "none" }}
                  >
                    {client.name}
                  </Link>
                  <div style={{ color: "var(--ash)", fontSize: 11, marginTop: 2 }}>{client.email}</div>
                </td>
                <td style={bodyCell}>{money.format(client.openTotal)}</td>
                <td style={bodyCell}>{money.format(client.paidTotal)}</td>
                <td style={bodyCell}>{client.invoiceCount}</td>
                <td style={bodyCell}>{client.overdueCount}</td>
                <td style={bodyCell}>{client.nextDue}</td>
              </tr>
            ))}
            {clientRows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 20, color: "var(--ash)" }}>No clients yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid var(--hair)", borderRadius: 8, padding: 14, background: "rgba(22,24,31,0.45)" }}>
      <div style={{ color: "var(--ash)", fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 24, fontFamily: "var(--font-mono)" }}>{value}</div>
    </div>
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
