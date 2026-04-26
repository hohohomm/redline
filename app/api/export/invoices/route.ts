import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(values: unknown[]): string {
  return values.map(csvEscape).join(",");
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
    .select("id, client_name, client_email, issue_date, due_date, subtotal, late_fee, total, status, last_reminder_stage, paid_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(`Export failed: ${error.message}`, { status: 500 });
  }

  const header = [
    "id",
    "client_name",
    "client_email",
    "issue_date",
    "due_date",
    "subtotal",
    "late_fee",
    "total",
    "status",
    "reminder_stage",
    "paid_at",
    "created_at",
  ];

  const lines = [csvRow(header)];
  for (const inv of invoices ?? []) {
    lines.push(
      csvRow([
        inv.id,
        inv.client_name,
        inv.client_email,
        inv.issue_date,
        inv.due_date,
        inv.subtotal,
        inv.late_fee,
        inv.total,
        inv.status,
        inv.last_reminder_stage,
        inv.paid_at ?? "",
        inv.created_at,
      ])
    );
  }

  const body = lines.join("\n") + "\n";
  const today = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="redline-invoices-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
