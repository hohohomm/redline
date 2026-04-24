export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export type Invoice = {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  late_fee: number;
  total: number;
  status: InvoiceStatus;
  last_reminder_stage: number;
  created_at: string | null;
};

export type LineItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};
