import { DashboardShell } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

type InvoiceRow = {
  id: string;
  client_name: string;
  total: number | string | null;
  status: string | null;
  due_date: string | null;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function CashflowPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, client_name, total, status, due_date")
    .order("due_date", { ascending: true });

  const invoices = (data ?? []) as InvoiceRow[];
  const openInvoices = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "void");
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue");
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
  const expected = openInvoices.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
  const overdue = overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
  const paid = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);

  const buckets = [
    { label: "Overdue", value: overdue, color: "#ff7468" },
    { label: "Due this week", value: sumDueWithin(openInvoices, 7), color: "#e8c07c" },
    { label: "Due 8-30d", value: sumDueBetween(openInvoices, 8, 30), color: "#9fd3aa" },
    { label: "Later", value: sumDueAfter(openInvoices, 30), color: "var(--ash)" },
  ];
  const maxBucket = Math.max(...buckets.map((bucket) => bucket.value), 1);

  return (
    <DashboardShell route="cashflow">
      <div style={{ padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>Cashflow</h1>
        <p style={{ margin: "8px 0 0", color: "var(--ash)", maxWidth: 680 }}>
          Expected cash by due date. Built from invoice status and totals.
        </p>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <Metric label="Expected" value={money.format(expected)} />
          <Metric label="Overdue" value={money.format(overdue)} />
          <Metric label="Paid recorded" value={money.format(paid)} />
        </div>

        <section style={{ marginTop: 18, border: "1px solid var(--hair)", borderRadius: 8, padding: 18, background: "rgba(22,24,31,0.45)" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Collection forecast</h2>
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            {buckets.map((bucket) => (
              <div key={bucket.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr 110px", gap: 12, alignItems: "center" }}>
                <div style={{ color: "var(--ash)", fontSize: 12 }}>{bucket.label}</div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{ width: `${(bucket.value / maxBucket) * 100}%`, height: "100%", background: bucket.color }} />
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, textAlign: "right" }}>{money.format(bucket.value)}</div>
              </div>
            ))}
          </div>
        </section>

        <table style={{ marginTop: 18, width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "var(--ash)", textAlign: "left" }}>
              <th style={headCell}>Invoice</th>
              <th style={headCell}>Client</th>
              <th style={headCell}>Amount</th>
              <th style={headCell}>Status</th>
              <th style={headCell}>Due</th>
            </tr>
          </thead>
          <tbody>
            {openInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={bodyCell}>{invoice.id.slice(0, 8)}</td>
                <td style={bodyCell}>{invoice.client_name}</td>
                <td style={bodyCell}>{money.format(Number(invoice.total ?? 0))}</td>
                <td style={{ ...bodyCell, textTransform: "capitalize" }}>{invoice.status}</td>
                <td style={bodyCell}>{invoice.due_date}</td>
              </tr>
            ))}
            {openInvoices.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 20, color: "var(--ash)" }}>No open invoices.</td>
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

function daysUntil(dueDate: string | null) {
  if (!dueDate) return 999;
  const due = new Date(`${dueDate}T00:00:00Z`).getTime();
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return Math.ceil((due - now.getTime()) / 86400000);
}

function sumDueWithin(invoices: InvoiceRow[], days: number) {
  return invoices
    .filter((invoice) => {
      const daysLeft = daysUntil(invoice.due_date);
      return daysLeft >= 0 && daysLeft <= days;
    })
    .reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
}

function sumDueBetween(invoices: InvoiceRow[], start: number, end: number) {
  return invoices
    .filter((invoice) => {
      const daysLeft = daysUntil(invoice.due_date);
      return daysLeft >= start && daysLeft <= end;
    })
    .reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
}

function sumDueAfter(invoices: InvoiceRow[], days: number) {
  return invoices
    .filter((invoice) => daysUntil(invoice.due_date) > days)
    .reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
}

const headCell = {
  padding: "10px 8px",
  borderBottom: "1px solid var(--hair)",
};

const bodyCell = {
  padding: "12px 8px",
  borderBottom: "1px solid var(--hair-soft)",
};
