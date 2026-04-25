import { z } from "zod";

export const reminderTones = ["gentle", "standard", "firm"] as const;
export type ReminderTone = (typeof reminderTones)[number];

export const currencies = ["AUD", "USD", "GBP", "EUR", "CAD", "NZD"] as const;
export type Currency = (typeof currencies)[number];

export const lateFeeTypes = ["none", "percent", "flat"] as const;
export type LateFeeType = (typeof lateFeeTypes)[number];

export const onboardingPresets = ["decide_for_me", "custom"] as const;
export type OnboardingPreset = (typeof onboardingPresets)[number];

export const tourSchema = z.object({
  owner_first_name: z.string().optional(),
  business_name: z.string().optional(),
  currency: z.enum(currencies).default("AUD"),
  late_fee_type: z.enum(lateFeeTypes).default("none"),
  late_fee_value: z.number().min(0).default(0),
  late_fee_after_days: z.number().int().min(1).default(7),
  reminder_tone: z.enum(reminderTones).default("standard"),
  onboarding_preset: z.enum(onboardingPresets).default("custom"),
});

export type TourFormValues = z.infer<typeof tourSchema>;

// Legacy schemas kept for any remaining references
export const csvRowSchema = z.object({
  client_name: z.string().min(1),
  client_email: z.string().email(),
  amount: z.number().positive(),
  due_date: z.string().min(1),
});

export type CsvRow = z.infer<typeof csvRowSchema>;
