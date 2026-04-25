import { NextResponse } from "next/server";

import { createInvoiceCheckoutUrl } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, client_name, total")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appUrl = process.env.APP_URL ?? new URL(_request.url).origin;
  const url = await createInvoiceCheckoutUrl({
    invoiceId: invoice.id,
    total: invoice.total,
    clientName: invoice.client_name,
    appUrl,
  });

  return NextResponse.json({ url });
}
