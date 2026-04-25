import { buildEmail, escapeHtml } from "@/lib/email/template-base";

type ReminderStage = 1 | 2 | 3 | 4;

type ReminderInvoice = {
  client_name: string;
  total: number;
  due_date: string;
  id: string;
  payment_url?: string;
};

const subjects: Record<ReminderStage, string> = {
  1: "Friendly invoice reminder",
  2: "Invoice overdue",
  3: "Late fee added",
  4: "Final invoice notice",
};

const titles: Record<ReminderStage, string> = {
  1: "Friendly reminder",
  2: "Invoice overdue",
  3: "Late fee added",
  4: "Final notice",
};

const intros: Record<ReminderStage, (amount: string) => string> = {
  1: (amount) => `Just checking in — invoice for $${amount} is still open.`,
  2: (amount) => `Your invoice for $${amount} is now overdue.`,
  3: (amount) => `A late fee has been applied to invoice for $${amount}.`,
  4: () => "Final notice before further steps. Please settle this invoice.",
};

const ctaLabels: Record<ReminderStage, string> = {
  1: "Pay invoice",
  2: "Pay invoice",
  3: "Pay invoice + fee",
  4: "Pay invoice",
};

export function reminderSubject(stage: ReminderStage): string {
  return subjects[stage];
}

export function reminderHtml(stage: ReminderStage, invoice: ReminderInvoice): string {
  const total = Number(invoice.total).toFixed(2);
  const paymentUrl =
    invoice.payment_url ??
    `${process.env.APP_URL}/dashboard/invoices/${invoice.id}`;

  const safeClientName = escapeHtml(invoice.client_name);

  return buildEmail({
    title: titles[stage],
    intro: intros[stage](total),
    ctaLabel: ctaLabels[stage],
    ctaUrl: paymentUrl,
    footer: `Sent to ${safeClientName}. If you have questions, reply to this email.`,
  });
}
