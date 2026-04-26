import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit";
import { createInvoiceCheckoutUrl } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

type InvoiceRequest = {
  client_name: string;
  client_email: string;
  due_date: string;
  rows: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rlResult = rateLimit(user.id, 30, 60 * 60 * 1000);
  if (!rlResult.ok) {
    const retryAfter = Math.ceil((rlResult.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "rate_limited", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body = (await request.json()) as InvoiceRequest;

  const rows = body.rows.map((row) => {
    const amount = row.quantity * row.unit_price;

    return {
      description: row.description,
      quantity: row.quantity,
      unit_price: row.unit_price,
      amount,
    };
  });

  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_name: body.client_name,
      client_email: body.client_email,
      due_date: body.due_date,
      subtotal,
      total: subtotal,
    })
    .select("id")
    .single();

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 });
  }

  const lineItems = rows.map((row) => {
    return {
      invoice_id: invoice.id,
      description: row.description,
      quantity: row.quantity,
      unit_price: row.unit_price,
      amount: row.amount,
    };
  });

  const { error: lineItemsError } = await supabase
    .from("line_items")
    .insert(lineItems);

  if (lineItemsError) {
    return NextResponse.json({ error: lineItemsError.message }, { status: 500 });
  }

  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;
  const paymentUrl = await createInvoiceCheckoutUrl({
    invoiceId: invoice.id,
    total: subtotal,
    clientName: body.client_name,
    appUrl,
  });

  await sendEmail({
    to: body.client_email,
    subject: "New invoice",
    html: `
      <main style="font-family: Arial, sans-serif; line-height: 1.5; color: #10131a;">
        <h1 style="font-size: 22px;">New invoice</h1>
        <p>Hi ${body.client_name},</p>
        <p>You have a new invoice due ${body.due_date}.</p>
        <p><strong>Total:</strong> $${subtotal.toFixed(2)}</p>
        <p><a href="${paymentUrl}">Pay invoice</a></p>
      </main>
    `,
  });

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { error: updateError } = await service
    .from("invoices")
    .update({ status: "sent" })
    .eq("id", invoice.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await service.from("events").insert({
    user_id: user.id,
    kind: "invoice.sent",
    payload: {
      invoice_id: invoice.id,
      client_email: body.client_email,
      total: subtotal,
    },
  });

  return NextResponse.json({ id: invoice.id });
}
