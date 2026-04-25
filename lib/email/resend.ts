import { Resend } from "resend";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: "RedLine <invoices@redlineinvoices.com>",
    to,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
