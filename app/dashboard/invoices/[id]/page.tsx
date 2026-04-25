import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardShell, InvoiceActions } from "@/components/redline-prototype";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, status, due_date, created_at, last_reminder_stage")
    .eq("id", params.id)
    .single();

  if (!invoice) {
    notFound();
  }

  return (
    <DashboardShell route="invoices">
      <div style={{ padding: 24, maxWidth: 760 }}>
        <Link href="/dashboard/invoices" style={{ color: "var(--ash)", fontSize: 13 }}>
          Back to invoices
        </Link>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: "-0.03em" }}>
            {invoice.client_name}
          </h1>
          <div style={{ color: "var(--ash)" }}>{invoice.client_email}</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <div style={{ border: "1px solid var(--hair)", padding: 14, borderRadius: 8 }}>
              <div style={{ color: "var(--ash)", fontSize: 12 }}>Amount</div>
              <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 20 }}>
                {money.format(Number(invoice.total ?? 0))}
              </div>
            </div>
            <div style={{ border: "1px solid var(--hair)", padding: 14, borderRadius: 8 }}>
              <div style={{ color: "var(--ash)", fontSize: 12 }}>Due</div>
              <div style={{ marginTop: 6 }}>{invoice.due_date}</div>
            </div>
            <div style={{ border: "1px solid var(--hair)", padding: 14, borderRadius: 8 }}>
              <div style={{ color: "var(--ash)", fontSize: 12 }}>Status</div>
              <div style={{ marginTop: 6, textTransform: "capitalize" }}>{invoice.status}</div>
            </div>
            <div style={{ border: "1px solid var(--hair)", padding: 14, borderRadius: 8 }}>
              <div style={{ color: "var(--ash)", fontSize: 12 }}>Reminder stage</div>
              <div style={{ marginTop: 6 }}>{invoice.last_reminder_stage}</div>
            </div>
          </div>

          <InvoiceActions id={invoice.id} status={invoice.status} />
        </div>
      </div>
    </DashboardShell>
  );
}
