import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { reminderHtml, reminderSubject } from "@/lib/email/templates";
import { computeLateFee, type LateFeeType } from "@/lib/late-fee";

type ReminderStage = 1 | 2 | 3 | 4;

type InvoiceRow = {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  due_date: string;
  subtotal: number;
  late_fee: number;
  total: number;
  status: "sent" | "overdue";
  last_reminder_stage: number;
};

type SettingsRow = {
  late_fee_type: LateFeeType;
  late_fee_value: number;
  late_fee_after_days: number;
};

function getTargetStage(daysOverdue: number) {
  if (daysOverdue >= 30) {
    return 4;
  }

  if (daysOverdue >= 21) {
    return 3;
  }

  if (daysOverdue >= 14) {
    return 2;
  }

  if (daysOverdue >= 7) {
    return 1;
  }

  return 0;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Kill switch — flip system_flags.cron_reminders.enabled=false to stop cron instantly.
  const { data: flag } = await supabase
    .from("system_flags")
    .select("enabled")
    .eq("key", "cron_reminders")
    .single();

  if (!flag?.enabled) {
    return NextResponse.json({ skipped: "cron_reminders disabled" });
  }

  // Dry-run mode — set DRY_RUN=true in Vercel env to test without sending emails.
  const dryRun = process.env.DRY_RUN === "true";

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, user_id, client_name, client_email, due_date, subtotal, late_fee, total, status, last_reminder_stage")
    .in("status", ["sent", "overdue"])
    .returns<InvoiceRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  let processed = 0;

  for (const invoice of invoices) {
    const dueDate = new Date(`${invoice.due_date}T00:00:00Z`);
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
    const targetStage = getTargetStage(daysOverdue);

    if (targetStage === 0 || targetStage <= invoice.last_reminder_stage) {
      continue;
    }

    const stage = targetStage as ReminderStage;
    let invoiceForEmail = invoice;

    if (stage === 3 && Number(invoice.late_fee) === 0) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("late_fee_type, late_fee_value, late_fee_after_days")
        .eq("user_id", invoice.user_id)
        .single<SettingsRow>();

      const lateFeeType = settings?.late_fee_type ?? "percent";
      const lateFeeValue = Number(settings?.late_fee_value ?? 5);
      const lateFeeAfterDays = Number(settings?.late_fee_after_days ?? 21);

      if (daysOverdue >= lateFeeAfterDays) {
        const fee = computeLateFee(
          Number(invoice.subtotal),
          lateFeeType,
          lateFeeValue,
        );
        const total = Number(invoice.subtotal) + fee;

        const { error: feeError } = await supabase
          .from("invoices")
          .update({ late_fee: fee, total })
          .eq("id", invoice.id);

        if (feeError) {
          return NextResponse.json({ error: feeError.message }, { status: 500 });
        }

        invoiceForEmail = {
          ...invoice,
          late_fee: fee,
          total,
        };
      }
    }

    if (dryRun) {
      // Dry-run debug — only log outside production to avoid leaking client emails into prod logs.
      if (process.env.NODE_ENV !== "production") {
        console.log(`[dry-run] Would send stage ${stage} to ${invoice.client_email} for invoice ${invoice.id}`);
      }
      processed += 1;
      continue;
    }

    // Wrap real send + logs in try/catch so one bad invoice doesn't kill the whole batch.
    try {
      await sendEmail({
        to: invoice.client_email,
        subject: reminderSubject(stage),
        html: reminderHtml(stage, invoiceForEmail),
      });

      await supabase
        .from("reminder_logs")
        .insert({ invoice_id: invoice.id, stage });

      const updates: { last_reminder_stage: ReminderStage; status?: "overdue" } = {
        last_reminder_stage: stage,
      };

      if (daysOverdue >= 14) {
        updates.status = "overdue";
      }

      await supabase
        .from("invoices")
        .update(updates)
        .eq("id", invoice.id);

      await supabase.from("events").insert({
        user_id: invoice.user_id,
        kind: "reminder.sent",
        payload: { invoice_id: invoice.id, stage, client_email: invoice.client_email },
      });

      processed += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase.from("events").insert({
        user_id: invoice.user_id,
        kind: "error.caught",
        payload: { where: "cron.reminders", invoice_id: invoice.id, stage, message },
      });
    }
  }

  await supabase.from("events").insert({
    kind: "cron.ran",
    payload: { processed, dryRun },
  });

  return NextResponse.json({ processed, dryRun });
}
