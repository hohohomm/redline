// Demo seed data — no Supabase, no env vars, pure constants.

export type DemoStatus = "draft" | "sent" | "overdue" | "paid";

export interface DemoLineItem {
  description: string;
  note?: string;
  qty: number;
  unitPrice: number;
}

export interface DemoInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  status: DemoStatus;
  issuedAt: string; // ISO date string
  dueDate: string;  // ISO date string
  paidAt?: string;
  lines: DemoLineItem[];
  subtotal: number;
  gst: number;
  total: number;
  reminderStage: number;
  paymentTerms: string;
  lateFee?: string;
}

export interface DemoClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  invoiceCount: number;
  totalBilled: number;
  totalOutstanding: number;
  lastInvoiceAt: string;
}

export interface DemoActivityEvent {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  type: "invoice_sent" | "invoice_opened" | "reminder_sent" | "marked_paid" | "invoice_created" | "payment_received";
  description: string;
  at: string; // ISO datetime
}

export interface DemoStats {
  outstanding: number;
  outstandingCount: number;
  overdue: number;
  overdueCount: number;
  paidThisMonth: number;
  paidThisMonthCount: number;
  avgDaysToPay: number;
}

export interface DemoUserSettings {
  businessName: string;
  businessEmail: string;
  abn: string;
  currency: string;
  defaultPaymentTerms: string;
  defaultLateFee: string;
  reminderTone: string;
  stripeConnected: boolean;
  emailDomain: string;
}

// ─── Clients ────────────────────────────────────────────────────────────────

export const demoClients: DemoClient[] = [
  {
    id: "client-1",
    name: "Acme Corp",
    email: "james@acmecorp.com",
    phone: "+61 2 9876 5432",
    invoiceCount: 3,
    totalBilled: 9890,
    totalOutstanding: 4250,
    lastInvoiceAt: "2026-03-28",
  },
  {
    id: "client-2",
    name: "Bob's Plumbing",
    email: "bob@bobsplumbing.com.au",
    phone: "+61 4 1234 5678",
    invoiceCount: 2,
    totalBilled: 2640,
    totalOutstanding: 1750,
    lastInvoiceAt: "2026-04-10",
  },
  {
    id: "client-3",
    name: "Tide Studio",
    email: "hello@tidestudio.co",
    phone: "+61 3 8765 4321",
    invoiceCount: 2,
    totalBilled: 3990,
    totalOutstanding: 0,
    lastInvoiceAt: "2026-04-01",
  },
];

// ─── Invoices ────────────────────────────────────────────────────────────────

export const demoInvoices: DemoInvoice[] = [
  {
    id: "inv-1024",
    invoiceNumber: "INV-1024",
    clientId: "client-1",
    clientName: "Acme Corp",
    clientEmail: "james@acmecorp.com",
    status: "overdue",
    issuedAt: "2026-03-28",
    dueDate: "2026-04-11",
    reminderStage: 2,
    paymentTerms: "Net 14",
    lateFee: "+$50 after 30 days",
    lines: [
      { description: "Brand strategy workshop", note: "2-day on-site session", qty: 1, unitPrice: 2000 },
      { description: "Creative direction retainer", note: "March 2026", qty: 1, unitPrice: 1500 },
      { description: "Asset deliverables", note: "Logo suite, brand guidelines PDF", qty: 1, unitPrice: 568.18 },
    ],
    subtotal: 4068.18,
    gst: 181.82,
    total: 4250,
  },
  {
    id: "inv-1025",
    invoiceNumber: "INV-1025",
    clientId: "client-2",
    clientName: "Bob's Plumbing",
    clientEmail: "bob@bobsplumbing.com.au",
    status: "sent",
    issuedAt: "2026-04-10",
    dueDate: "2026-04-24",
    reminderStage: 0,
    paymentTerms: "Net 14",
    lines: [
      { description: "Website redesign — Phase 1", note: "Homepage + about page", qty: 1, unitPrice: 1200 },
      { description: "Mobile responsive pass", qty: 1, unitPrice: 390.91 },
    ],
    subtotal: 1590.91,
    gst: 159.09,
    total: 1750,
  },
  {
    id: "inv-1026",
    invoiceNumber: "INV-1026",
    clientId: "client-3",
    clientName: "Tide Studio",
    clientEmail: "hello@tidestudio.co",
    status: "paid",
    issuedAt: "2026-03-20",
    dueDate: "2026-04-03",
    paidAt: "2026-04-01",
    reminderStage: 0,
    paymentTerms: "Net 14",
    lines: [
      { description: "Brand identity package", note: "Logo, colour palette, type guide", qty: 1, unitPrice: 2400 },
      { description: "Stationery templates", note: "Business card + letterhead", qty: 1, unitPrice: 381.82 },
    ],
    subtotal: 2781.82,
    gst: 108.18,
    total: 2890,
  },
  {
    id: "inv-1027",
    invoiceNumber: "INV-1027",
    clientId: "client-3",
    clientName: "Tide Studio",
    clientEmail: "hello@tidestudio.co",
    status: "paid",
    issuedAt: "2026-02-14",
    dueDate: "2026-02-28",
    paidAt: "2026-02-25",
    reminderStage: 0,
    paymentTerms: "Net 14",
    lines: [
      { description: "Social media kit", note: "10 templates, Figma source", qty: 1, unitPrice: 890.91 },
      { description: "Copy editing", qty: 2, unitPrice: 100 },
    ],
    subtotal: 1090.91,
    gst: 9.09,
    total: 1100,
  },
  {
    id: "inv-1028",
    invoiceNumber: "INV-1028",
    clientId: "client-1",
    clientName: "Acme Corp",
    clientEmail: "james@acmecorp.com",
    status: "draft",
    issuedAt: "2026-04-22",
    dueDate: "2026-05-06",
    reminderStage: 0,
    paymentTerms: "Net 14",
    lines: [
      { description: "Q2 strategy session", note: "Quarterly planning", qty: 1, unitPrice: 3000 },
      { description: "Pitch deck design", qty: 1, unitPrice: 854.55 },
    ],
    subtotal: 3854.55,
    gst: 145.45,
    total: 4000,
  },
];

// ─── Activity ────────────────────────────────────────────────────────────────

export const demoActivity: DemoActivityEvent[] = [
  {
    id: "act-1",
    invoiceId: "inv-1028",
    invoiceNumber: "INV-1028",
    clientName: "Acme Corp",
    type: "invoice_created",
    description: "Invoice INV-1028 created as draft",
    at: "2026-04-22T09:14:00",
  },
  {
    id: "act-2",
    invoiceId: "inv-1024",
    invoiceNumber: "INV-1024",
    clientName: "Acme Corp",
    type: "reminder_sent",
    description: "Reminder 2 (Overdue notice) sent to james@acmecorp.com",
    at: "2026-04-18T08:00:00",
  },
  {
    id: "act-3",
    invoiceId: "inv-1025",
    invoiceNumber: "INV-1025",
    clientName: "Bob's Plumbing",
    type: "invoice_sent",
    description: "Invoice sent to bob@bobsplumbing.com.au",
    at: "2026-04-10T10:22:00",
  },
  {
    id: "act-4",
    invoiceId: "inv-1025",
    invoiceNumber: "INV-1025",
    clientName: "Bob's Plumbing",
    type: "invoice_opened",
    description: "Invoice opened by client",
    at: "2026-04-10T14:05:00",
  },
  {
    id: "act-5",
    invoiceId: "inv-1024",
    invoiceNumber: "INV-1024",
    clientName: "Acme Corp",
    type: "reminder_sent",
    description: "Reminder 1 (Friendly nudge) sent to james@acmecorp.com",
    at: "2026-04-14T08:00:00",
  },
  {
    id: "act-6",
    invoiceId: "inv-1026",
    invoiceNumber: "INV-1026",
    clientName: "Tide Studio",
    type: "marked_paid",
    description: "Invoice marked paid — $2,890.00 received",
    at: "2026-04-01T11:30:00",
  },
  {
    id: "act-7",
    invoiceId: "inv-1024",
    invoiceNumber: "INV-1024",
    clientName: "Acme Corp",
    type: "invoice_opened",
    description: "Invoice opened by client",
    at: "2026-03-28T11:47:00",
  },
  {
    id: "act-8",
    invoiceId: "inv-1024",
    invoiceNumber: "INV-1024",
    clientName: "Acme Corp",
    type: "invoice_sent",
    description: "Invoice sent to james@acmecorp.com",
    at: "2026-03-28T09:02:00",
  },
  {
    id: "act-9",
    invoiceId: "inv-1027",
    invoiceNumber: "INV-1027",
    clientName: "Tide Studio",
    type: "marked_paid",
    description: "Invoice marked paid — $1,100.00 received",
    at: "2026-02-25T16:00:00",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────

export const demoStats: DemoStats = {
  outstanding: 4250 + 1750,  // overdue + sent
  outstandingCount: 2,
  overdue: 4250,
  overdueCount: 1,
  paidThisMonth: 2890,       // INV-1026 paid in April 2026
  paidThisMonthCount: 1,
  avgDaysToPay: 8.5,
};

// ─── User settings ────────────────────────────────────────────────────────────

export const demoUserSettings: DemoUserSettings = {
  businessName: "Your Studio",
  businessEmail: "hello@yourstudio.com",
  abn: "12 345 678 901",
  currency: "AUD",
  defaultPaymentTerms: "Net 14",
  defaultLateFee: "$50 after 30 days",
  reminderTone: "Friendly",
  stripeConnected: true,
  emailDomain: "yourstudio.com",
};
