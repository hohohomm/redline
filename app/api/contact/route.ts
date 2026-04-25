import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { buildEmail, escapeHtml } from "@/lib/email/template-base";

type ContactRequest = {
  name?: string;
  email?: string;
  subject?: string;
  body?: string;
};

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

  const messageBlock = `
    <div style="margin:18px 0;background:#08090b;border:1px solid #2a2c33;border-radius:8px;padding:16px;">
      <p style="margin:0 0 10px;color:#777274;font-size:12px;font-family:Arial,sans-serif;">Subject: ${escapeHtml(subject || "No subject")}</p>
      <pre style="margin:0;color:#a6a2a0;font-size:13px;font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.6;">${escapeHtml(messageBody)}</pre>
    </div>
  `;

  await sendEmail({
    from: "RedLine Support <support@redlineinvoices.com>",
    to: "support@redlineinvoices.com",
    replyTo: email,
    subject: subject ? `Contact: ${subject}` : "New Redline contact message",
    html: buildEmail({
      title: "New contact message",
      intro: `${escapeHtml(name)} &lt;${escapeHtml(email)}&gt; sent a message via the contact form.`,
      extraBlock: messageBlock,
      footer: `Reply-To: <span style="color:#ff9a91;">${escapeHtml(email)}</span>`,
    }),
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
