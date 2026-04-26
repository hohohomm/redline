import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

type InvoiceRow = {
  client_name: string | null;
  client_email: string | null;
  total: number | string | null;
  status: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};

type Agg = {
  name: string;
  email: string;
  openTotal: number;
  paidTotal: number;
  invoiceCount: number;
  overdueCount: number;
  firstInvoiceAt: string;
  lastPaidAt: string | null;
};

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rlResult = rateLimit(user.id, 10, 60 * 60 * 1000);
  if (!rlResult.ok) {
    const retryAfter = Math.ceil((rlResult.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({ error: "rate_limited", retryAfter }),
      { status: 429, headers: { "Retry-After": String(retryAfter), "Content-Type": "application/json" } },
    );
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("client_name, client_email, total, status, due_date, paid_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(`Export failed: ${error.message}`, { status: 500 });
  }

  const byEmail = new Map<string, Agg>();
  for (const inv of (invoices ?? []) as InvoiceRow[]) {
    const email = inv.client_email ?? "unknown";
    const status = inv.status ?? "draft";
    const total = Number(inv.total ?? 0);
    const isOpen = status !== "paid" && status !== "void";

    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, {
        name: inv.client_name ?? "Unnamed client",
        email,
        openTotal: isOpen ? total : 0,
        paidTotal: status === "paid" ? total : 0,
        invoiceCount: 1,
        overdueCount: status === "overdue" ? 1 : 0,
        firstInvoiceAt: inv.created_at,
        lastPaidAt: inv.paid_at,
      });
      continue;
    }
    existing.openTotal += isOpen ? total : 0;
    existing.paidTotal += status === "paid" ? total : 0;
    existing.invoiceCount += 1;
    existing.overdueCount += status === "overdue" ? 1 : 0;
    if (inv.paid_at && (!existing.lastPaidAt || inv.paid_at > existing.lastPaidAt)) {
      existing.lastPaidAt = inv.paid_at;
    }
  }

  const header = ["name", "email", "invoices", "overdue", "paid_total", "open_total", "first_invoice_at", "last_paid_at"];
  const rows = [header.join(",")];
  for (const c of Array.from(byEmail.values()).sort((a, b) => b.openTotal - a.openTotal)) {
    rows.push(
      [
        csvEscape(c.name),
        csvEscape(c.email),
        c.invoiceCount,
        c.overdueCount,
        c.paidTotal.toFixed(2),
        c.openTotal.toFixed(2),
        csvEscape(c.firstInvoiceAt),
        csvEscape(c.lastPaidAt ?? ""),
      ].join(",")
    );
  }

  const body = rows.join("\n") + "\n";
  const today = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="redline-clients-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
