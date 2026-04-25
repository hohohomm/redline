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

const messages: Record<ReminderStage, string> = {
  1: "Just a friendly reminder that this invoice is still open.",
  2: "Your invoice is now overdue. Please arrange payment when you can.",
  3: "A late fee has been applied because this invoice remains unpaid.",
  4: "Final notice before further action. Please settle this invoice.",
};

export function reminderSubject(stage: ReminderStage) {
  return subjects[stage];
}

export function reminderHtml(stage: ReminderStage, invoice: ReminderInvoice) {
  const total = Number(invoice.total).toFixed(2);
  const paymentUrl = invoice.payment_url ?? `${process.env.APP_URL}/dashboard/invoices/${invoice.id}`;

  return `
    <main style="font-family: Arial, sans-serif; line-height: 1.5; color: #10131a;">
      <h1 style="font-size: 22px;">${subjects[stage]}</h1>
      <p>Hi ${invoice.client_name},</p>
      <p>${messages[stage]}</p>
      <p><strong>Total:</strong> $${total}</p>
      <p><strong>Due date:</strong> ${invoice.due_date}</p>
      <p><a href="${paymentUrl}">Pay invoice</a></p>
    </main>
  `;
}
