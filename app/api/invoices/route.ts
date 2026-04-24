import { NextResponse } from "next/server";

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

  return NextResponse.json({ id: invoice.id });
}
