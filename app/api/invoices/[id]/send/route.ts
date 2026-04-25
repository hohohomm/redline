import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { buildEmail, escapeHtml } from "@/lib/email/template-base";
import { createInvoiceCheckoutUrl } from "@/lib/stripe";
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

  const { data: settings } = await supabase
    .from("user_settings")
    .select("business_name")
    .eq("user_id", user.id)
    .single();

  const businessName = settings?.business_name ?? "Redline";

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const appUrl = process.env.APP_URL ?? new URL(_request.url).origin;
  const paymentUrl = await createInvoiceCheckoutUrl({
    invoiceId: invoice.id,
    total: invoice.total,
    clientName: invoice.client_name,
    appUrl,
  });

  const total = Number(invoice.total).toFixed(2);
  const safeBusinessName = escapeHtml(businessName);
  const safeClientName = escapeHtml(invoice.client_name);

  await sendEmail({
    to: invoice.client_email,
    subject: `Invoice from ${businessName}`,
    html: buildEmail({
      title: `Invoice from ${safeBusinessName}`,
      intro: `${safeBusinessName} sent you an invoice for $${total}, due ${escapeHtml(invoice.due_date)}.`,
      ctaLabel: "View & pay invoice",
      ctaUrl: paymentUrl,
      footer: `Sent to ${safeClientName}. If you have questions, reply to this email.`,
    }),
  });

  const { error: updateError } = await service
    .from("invoices")
    .update({ status: "sent" })
    .eq("id", invoice.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: eventError } = await service.from("events").insert({
    user_id: user.id,
    kind: "invoice.sent",
    payload: {
      invoice_id: invoice.id,
      client_email: invoice.client_email,
      total: invoice.total,
    },
  });

  if (eventError) {
    console.error("invoice.sent event insert failed", eventError.message);
  }

  return NextResponse.json({ sent: true });
}
