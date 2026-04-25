import { Resend } from "resend";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, from, replyTo }: SendEmailArgs) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: from ?? "RedLine <invoices@redlineinvoices.com>",
    to,
    subject,
    html,
    replyTo,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
