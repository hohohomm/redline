"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { saveOnboardingTour } from "@/lib/actions/onboarding";
import { currencies, type Currency, type LateFeeType, type ReminderTone } from "@/types/onboarding";

// Detect locale-based default currency
function detectCurrency(): Currency {
  if (typeof navigator === "undefined") return "AUD";
  const locale = navigator.language ?? "";
  if (locale.includes("en-US")) return "USD";
  if (locale.includes("en-GB")) return "GBP";
  if (locale.includes("en-CA")) return "CAD";
  if (locale.includes("en-NZ")) return "NZD";
  return "AUD";
}

const TOTAL_STEPS = 4;

const TONE_PREVIEWS: Record<ReminderTone, string> = {
  gentle: "Just a gentle reminder — invoice #42 is due soon. No rush at all.",
  standard: "Invoice #42 is now overdue. Please arrange payment at your earliest convenience.",
  firm: "Invoice #42 is 7 days overdue. Payment is required immediately to avoid further action.",
};

interface TourState {
  ownerFirstName: string;
  businessName: string;
  currency: Currency;
  lateFeeType: LateFeeType;
  lateFeeValue: string;
  lateFeeAfterDays: string;
  reminderTone: ReminderTone;
}

export default function RedlineTour() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<TourState>({
    ownerFirstName: "",
    businessName: "",
    currency: "AUD",
    lateFeeType: "none",
    lateFeeValue: "1.5",
    lateFeeAfterDays: "7",
    reminderTone: "standard",
  });

  // Set detected currency on mount
  useEffect(() => {
    setState((prev) => ({ ...prev, currency: detectCurrency() }));
  }, []);

  const advance = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step]);

  const finish = useCallback(
    async (preset: "custom" | "decide_for_me" = "custom") => {
      setSaving(true);
      setError(null);

      const detectedCurrency = detectCurrency();
      const input =
        preset === "decide_for_me"
          ? {
              currency: detectedCurrency,
              late_fee_type: "percent" as LateFeeType,
              late_fee_value: 1.5,
              late_fee_after_days: 7,
              reminder_tone: "standard" as ReminderTone,
              onboarding_preset: "decide_for_me" as const,
            }
          : {
              owner_first_name: state.ownerFirstName || undefined,
              business_name: state.businessName || undefined,
              currency: state.currency,
              late_fee_type: state.lateFeeType,
              late_fee_value: parseFloat(state.lateFeeValue) || 0,
              late_fee_after_days: parseInt(state.lateFeeAfterDays, 10) || 7,
              reminder_tone: state.reminderTone,
              onboarding_preset: "custom" as const,
            };

      const result = await saveOnboardingTour(input);
      setSaving(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/dashboard");
    },
    [state, router]
  );

  const handleDecideForMe = useCallback(() => finish("decide_for_me"), [finish]);

  const handleContinue = useCallback(() => {
    if (step === TOTAL_STEPS - 1) {
      finish("custom");
    } else {
      advance();
    }
  }, [step, finish, advance]);

  // Keyboard handling
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showSkipDialog) {
        if (e.key === "Escape") setShowSkipDialog(false);
        return;
      }
      if (e.key === "Enter" && !saving) handleContinue();
      if (e.key === "Escape") setShowSkipDialog(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleContinue, showSkipDialog, saving]);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--graphite-900, #08090b)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        overflow: "hidden",
      }}
    >
      {/* Ambient red radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,75,62,0.10) 0%, transparent 70%)",
          animation: "tour-pulse 8s ease-in-out infinite",
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(255,255,255,0.06)",
          zIndex: 10,
        }}
      >
        <motion.div
          style={{ height: "100%", background: "#ff4b3e", transformOrigin: "left" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Card */}
      <div style={{ position: "relative", width: "100%", maxWidth: 560 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "#101116",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "32px 32px 28px",
              position: "relative",
            }}
          >
            {/* Rei avatar + speech bubble */}
            <ReiSpeech step={step} />

            {/* Step content */}
            <div style={{ marginTop: 20 }}>
              {step === 0 && (
                <NameStep
                  value={state.ownerFirstName}
                  onChange={(v) => setState((s) => ({ ...s, ownerFirstName: v }))}
                />
              )}
              {step === 1 && (
                <BusinessStep
                  value={state.businessName}
                  onChange={(v) => setState((s) => ({ ...s, businessName: v }))}
                />
              )}
              {step === 2 && (
                <MoneyStep
                  currency={state.currency}
                  lateFeeType={state.lateFeeType}
                  lateFeeValue={state.lateFeeValue}
                  lateFeeAfterDays={state.lateFeeAfterDays}
                  onCurrencyChange={(v) => setState((s) => ({ ...s, currency: v }))}
                  onLateFeeTypeChange={(v) => setState((s) => ({ ...s, lateFeeType: v }))}
                  onLateFeeValueChange={(v) => setState((s) => ({ ...s, lateFeeValue: v }))}
                  onLateFeeAfterDaysChange={(v) => setState((s) => ({ ...s, lateFeeAfterDays: v }))}
                />
              )}
              {step === 3 && (
                <VoiceStep
                  tone={state.reminderTone}
                  onChange={(v) => setState((s) => ({ ...s, reminderTone: v }))}
                />
              )}
            </div>

            {error && (
              <p style={{ color: "#ff4b3e", fontSize: 13, marginTop: 12 }}>{error}</p>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 28,
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={handleDecideForMe}
                disabled={saving}
                style={ghostButtonStyle}
              >
                Decide for me
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                style={primaryButtonStyle}
              >
                {saving ? "Saving…" : step === TOTAL_STEPS - 1 ? "Finish" : "Continue"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip dialog */}
      <AnimatePresence>
        {showSkipDialog && (
          <SkipDialog
            onConfirm={() => {
              setShowSkipDialog(false);
              finish("decide_for_me");
            }}
            onCancel={() => setShowSkipDialog(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes tour-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .tour-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          color: #f5f1ea;
          font-size: 16px;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .tour-input:focus {
          border-color: rgba(255,75,62,0.5);
        }
        .tour-input::placeholder {
          color: #4a4a55;
        }
        .tour-select {
          appearance: none;
          background: rgba(255,255,255,0.04) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          color: #f5f1ea;
          font-size: 15px;
          padding: 11px 36px 11px 14px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .tour-select:focus {
          border-color: rgba(255,75,62,0.5);
        }
        .tour-select option {
          background: #18191f;
          color: #f5f1ea;
        }
        .tone-card {
          cursor: pointer;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          padding: 14px 16px;
          transition: border-color 0.15s, background 0.15s;
          flex: 1;
          min-width: 0;
        }
        .tone-card:hover {
          border-color: rgba(255,75,62,0.4);
          background: rgba(255,75,62,0.04);
        }
        .tone-card.selected {
          border-color: #ff4b3e;
          background: rgba(255,75,62,0.08);
        }
      `}</style>
    </div>
  );
}

// ── Rei speech bubble ──────────────────────────────────────────────

const REI_LINES: string[] = [
  "Hey — I'm Rei. I'll handle your follow-ups. What should I call you?",
  "What name goes on your invoices?",
  "How do you charge late payers?",
  "How firm should I be when nudging?",
];

function ReiSpeech({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      {/* Avatar — abstract Rei mark, dark + red ring */}
      <div
        aria-label="Rei"
        role="img"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#0c0d11",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 1.5px #ff4b3e, 0 0 14px rgba(255,75,62,0.45)",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: 15,
          fontWeight: 600,
          color: "#ff6a5a",
          letterSpacing: "-0.04em",
          textShadow: "0 0 8px rgba(255,75,62,0.6)",
        }}
      >
        R
      </div>

      {/* Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0 12px 12px 12px",
            padding: "10px 14px",
            color: "#a6a2a0",
            fontSize: 14,
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {REI_LINES[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Step components ────────────────────────────────────────────────

function NameStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>First name</label>
      <input
        autoFocus
        className="tour-input"
        type="text"
        placeholder="e.g. Alex"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function BusinessStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>Business name</label>
      <input
        autoFocus
        className="tour-input"
        type="text"
        placeholder="e.g. Smith & Co"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MoneyStep({
  currency,
  lateFeeType,
  lateFeeValue,
  lateFeeAfterDays,
  onCurrencyChange,
  onLateFeeTypeChange,
  onLateFeeValueChange,
  onLateFeeAfterDaysChange,
}: {
  currency: Currency;
  lateFeeType: LateFeeType;
  lateFeeValue: string;
  lateFeeAfterDays: string;
  onCurrencyChange: (v: Currency) => void;
  onLateFeeTypeChange: (v: LateFeeType) => void;
  onLateFeeValueChange: (v: string) => void;
  onLateFeeAfterDaysChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>Currency</label>
        <select
          className="tour-select"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Late fee</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["none", "percent", "flat"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onLateFeeTypeChange(t)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 10,
                border: `1px solid ${lateFeeType === t ? "#ff4b3e" : "rgba(255,255,255,0.08)"}`,
                background: lateFeeType === t ? "rgba(255,75,62,0.10)" : "rgba(255,255,255,0.03)",
                color: lateFeeType === t ? "#ff4b3e" : "#a6a2a0",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
                fontWeight: lateFeeType === t ? 500 : 400,
              }}
            >
              {t === "none" ? "None" : t === "percent" ? "% rate" : "Flat fee"}
            </button>
          ))}
        </div>
      </div>

      {lateFeeType !== "none" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{ display: "flex", gap: 12 }}
        >
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              {lateFeeType === "percent" ? "Rate (%)" : "Amount"}
            </label>
            <input
              className="tour-input"
              type="number"
              min="0"
              step="0.01"
              value={lateFeeValue}
              onChange={(e) => onLateFeeValueChange(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>After (days)</label>
            <input
              className="tour-input"
              type="number"
              min="1"
              step="1"
              value={lateFeeAfterDays}
              onChange={(e) => onLateFeeAfterDaysChange(e.target.value)}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function VoiceStep({
  tone,
  onChange,
}: {
  tone: ReminderTone;
  onChange: (v: ReminderTone) => void;
}) {
  const options: { value: ReminderTone; label: string }[] = [
    { value: "gentle", label: "Friendly" },
    { value: "standard", label: "Neutral" },
    { value: "firm", label: "Firm" },
  ];

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`tone-card${tone === opt.value ? " selected" : ""}`}
          onClick={() => onChange(opt.value)}
          style={{ textAlign: "left" }}
        >
          <div
            style={{
              fontWeight: 500,
              fontSize: 14,
              color: tone === opt.value ? "#ff4b3e" : "#f5f1ea",
              marginBottom: 6,
            }}
          >
            {opt.label}
          </div>
          <div style={{ fontSize: 12, color: "#6b6b72", lineHeight: 1.45 }}>
            &ldquo;{TONE_PREVIEWS[opt.value].substring(0, 60)}&hellip;&rdquo;
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Skip dialog ────────────────────────────────────────────────────

function SkipDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,9,11,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "0 20px",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "#101116",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: "28px 28px 24px",
          maxWidth: 400,
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: "0 0 10px",
            fontSize: 18,
            fontWeight: 500,
            color: "#f5f1ea",
            letterSpacing: "-0.02em",
          }}
        >
          Skip for now?
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#a6a2a0", lineHeight: 1.5 }}>
          Rei will apply sensible defaults. You can update everything in settings later.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={ghostButtonStyle}>
            Go back
          </button>
          <button type="button" onClick={onConfirm} style={primaryButtonStyle}>
            Skip &amp; apply defaults
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#6b6b72",
  marginBottom: 8,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  fontWeight: 500,
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#ff4b3e",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 22px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "-0.01em",
  transition: "opacity 0.15s",
};

const ghostButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: "#6b6b72",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "11px 18px",
  fontSize: 14,
  cursor: "pointer",
  transition: "color 0.15s, border-color 0.15s",
};
