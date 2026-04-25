import Link from "next/link";

import { DashboardShell, InvoiceActions } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function InvoicesListPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, status, due_date, created_at")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell route="invoices">
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>
            Invoices
          </h1>
          <Link href="/dashboard/invoices/new" style={{ color: "#ff7468", fontSize: 13 }}>
            + New invoice
          </Link>
        </div>

        <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "var(--ash)", textAlign: "left" }}>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--hair)" }}>Client</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--hair)" }}>Amount</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--hair)" }}>Due</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--hair)" }}>Status</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid var(--hair)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((invoice) => (
              <tr key={invoice.id}>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid var(--hair-soft)" }}>
                  <Link href={`/dashboard/invoices/${invoice.id}`} style={{ color: "var(--warm-white)" }}>
                    {invoice.client_name}
                  </Link>
                  <div style={{ color: "var(--ash)", fontSize: 11, marginTop: 2 }}>{invoice.client_email}</div>
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid var(--hair-soft)", fontFamily: "var(--font-mono)" }}>
                  {money.format(Number(invoice.total ?? 0))}
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid var(--hair-soft)" }}>
                  {invoice.due_date}
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid var(--hair-soft)", textTransform: "capitalize" }}>
                  {invoice.status}
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid var(--hair-soft)" }}>
                  <InvoiceActions id={invoice.id} status={invoice.status} />
                </td>
              </tr>
            ))}
            {(invoices ?? []).length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 20, color: "var(--ash)" }}>
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
