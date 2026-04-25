import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";

type ContactRequest = {
  name?: string;
  email?: string;
  subject?: string;
  body?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  const body = (await request.json()) as ContactRequest;
  const name = body.name?.trim();
  const email = body.email?.trim();
  const subject = body.subject?.trim();
  const messageBody = body.body?.trim();

  if (!name || !email || !messageBody) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  if (messageBody.length > 5000) {
    return NextResponse.json({ error: "too long" }, { status: 400 });
  }

  await sendEmail({
    from: "RedLine Support <support@redlineinvoices.com>",
    to: "support@redlineinvoices.com",
    replyTo: email,
    subject: subject ? `Contact: ${subject}` : "New Redline contact message",
    html: `
      <main style="font-family: Arial, sans-serif; line-height: 1.5; color: #10131a;">
        <h1 style="font-size: 20px;">New Redline contact message</h1>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject || "No subject")}</p>
        <hr />
        <p style="white-space: pre-wrap;">${escapeHtml(messageBody)}</p>
      </main>
    `,
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await supabase.from("contact_messages").insert({
    name,
    email,
    subject: subject || null,
    body: messageBody,
  });

  await supabase.from("events").insert({
    kind: "contact.received",
    payload: { email, subject },
  });

  return NextResponse.json({ ok: true });
}
