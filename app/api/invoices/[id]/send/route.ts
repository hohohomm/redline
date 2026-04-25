import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, client_name, client_email, total, due_date")
    .eq("id", params.id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await sendEmail({
    to: invoice.client_email,
    subject: "New invoice",
    html: `<p>Hi ${invoice.client_name},</p><p>You have a new invoice for $${invoice.total} due ${invoice.due_date}.</p><p>Pay link coming in a follow-up reminder or ask for it directly.</p>`,
  });

  await service
    .from("invoices")
    .update({ status: "sent" })
    .eq("id", invoice.id);

  await service.from("events").insert({
    user_id: user.id,
    kind: "invoice.sent",
    payload: {
      invoice_id: invoice.id,
      client_email: invoice.client_email,
      total: invoice.total,
    },
  });

  return NextResponse.json({ sent: true });
}
