"use client";

import React from "react";
import Link from "next/link";
import { demoUserSettings } from "@/lib/demo/seed";
import { DemoToast, useDemoToast } from "@/components/demo/DemoToast";

const Field = ({
  label,
  value,
  hint,
  onFire,
}: {
  label: string;
  value: string;
  hint?: string;
  onFire: () => void;
}) => (
  <label style={{ display: "block" }}>
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 500,
        color: "var(--ash)",
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {label}
      <span
        style={{
          fontSize: 10,
          fontWeight: 400,
          textTransform: "none",
          color: "var(--ash-dim)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--hair)",
          borderRadius: 4,
          padding: "1px 6px",
          letterSpacing: 0,
        }}
      >
        Demo mode — read only
      </span>
    </div>
    <div
      onClick={onFire}
      style={{
        display: "flex",
        alignItems: "center",
        height: 40,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--hair)",
        borderRadius: 9,
        padding: "0 12px",
        fontSize: 13.5,
        color: "var(--ash)",
        cursor: "not-allowed",
        opacity: 0.7,
      }}
    >
      {value}
    </div>
    {hint && (
      <div style={{ fontSize: 11.5, color: "var(--ash-dim)", marginTop: 6, letterSpacing: "-0.005em" }}>{hint}</div>
    )}
  </label>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    style={{
      background: "linear-gradient(180deg,rgba(22,24,31,0.9) 0%,rgba(12,13,17,0.9) 100%)",
      border: "1px solid var(--hair)",
      borderRadius: 14,
      padding: 24,
    }}
  >
    <div
      style={{
        fontSize: 11,
        color: "#ff7468",
        fontFamily: "var(--font-mono)",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 20,
      }}
    >
      {title}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
  </div>
);

const Toggle = ({ label, checked, onFire }: { label: string; checked: boolean; onFire: () => void }) => (
  <div
    onClick={onFire}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "not-allowed",
      opacity: 0.7,
    }}
  >
    <span style={{ fontSize: 13.5, color: "var(--warm-white-dim)", letterSpacing: "-0.005em" }}>{label}</span>
    <div
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        background: checked ? "rgba(255,75,62,0.3)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${checked ? "rgba(255,75,62,0.4)" : "var(--hair)"}`,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: checked ? "#ff4b3e" : "var(--ash-deep)",
          transition: "left 160ms",
        }}
      />
    </div>
  </div>
);

export default function DemoSettingsPage() {
  const { visible, fire, hide } = useDemoToast();

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid var(--hair)",
          position: "sticky",
          top: 37,
          background: "rgba(8,9,11,0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>Settings</h1>
        <button
          onClick={fire}
          style={{
            height: 30,
            padding: "0 14px",
            fontSize: 12.5,
            fontWeight: 500,
            background: "linear-gradient(180deg,#ff4b3e 0%,#d8352a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "not-allowed",
            opacity: 0.6,
          }}
        >
          Save changes
        </button>
      </div>

      <div style={{ padding: 24, maxWidth: 720, display: "flex", flexDirection: "column", gap: 20, animation: "rl-fade-up 400ms var(--ease-out)" }}>
        {/* Demo notice */}
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(255,75,62,0.06)",
            border: "1px solid rgba(255,75,62,0.2)",
            borderRadius: 10,
            fontSize: 13.5,
            color: "var(--warm-white-dim)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ color: "#ff7468", fontSize: 16, flexShrink: 0 }}>🔒</span>
          <span>
            Settings are read-only in demo mode.{" "}
            <Link href="/login" style={{ color: "#ff7468", textDecoration: "underline", textDecorationColor: "rgba(255,75,62,0.4)" }}>
              Sign up free
            </Link>{" "}
            to configure your own workspace.
          </span>
        </div>

        <Section title="Business">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Business name" value={demoUserSettings.businessName} onFire={fire} />
            <Field label="Business email" value={demoUserSettings.businessEmail} onFire={fire} />
          </div>
          <Field label="ABN" value={demoUserSettings.abn} hint="Used on invoice PDFs" onFire={fire} />
        </Section>

        <Section title="Invoice defaults">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Currency" value={demoUserSettings.currency} onFire={fire} />
            <Field label="Payment terms" value={demoUserSettings.defaultPaymentTerms} onFire={fire} />
          </div>
          <Field label="Default late fee" value={demoUserSettings.defaultLateFee} hint="Applied to invoices past due" onFire={fire} />
          <Field label="Reminder tone" value={demoUserSettings.reminderTone} hint="Controls how Rei phrases follow-ups" onFire={fire} />
        </Section>

        <Section title="Integrations">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
            <div>
              <div style={{ fontSize: 13.5, color: "var(--warm-white)", marginBottom: 4, letterSpacing: "-0.005em" }}>Stripe</div>
              <div style={{ fontSize: 12, color: "var(--ash)" }}>Accept card payments via Stripe Checkout</div>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                height: 24,
                padding: "0 10px",
                background: "rgba(126,192,138,0.1)",
                color: "#9fd3aa",
                border: "1px solid rgba(126,192,138,0.25)",
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 500,
              }}
            >
              ✓ Connected
            </span>
          </div>
          <div style={{ borderTop: "1px solid var(--hair)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13.5, color: "var(--warm-white)", marginBottom: 4, letterSpacing: "-0.005em" }}>Custom email domain</div>
                <div style={{ fontSize: 12, color: "var(--ash)" }}>Send invoices from your own domain via Resend</div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--ash)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: 0,
                }}
              >
                {demoUserSettings.emailDomain}
              </span>
            </div>
          </div>
        </Section>

        <Section title="Automation">
          <Toggle label="Auto-send reminders" checked={true} onFire={fire} />
          <Toggle label="Late fee auto-apply after 30 days" checked={true} onFire={fire} />
          <Toggle label="Notify me on invoice open" checked={false} onFire={fire} />
          <Toggle label="Weekly cashflow digest email" checked={true} onFire={fire} />
        </Section>

        <Section title="Danger zone">
          <div
            style={{
              padding: "16px 18px",
              background: "rgba(155,28,31,0.08)",
              border: "1px solid rgba(255,75,62,0.2)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 13.5, color: "#ff9089", marginBottom: 6, letterSpacing: "-0.005em" }}>Delete account</div>
            <div style={{ fontSize: 12.5, color: "var(--ash)", marginBottom: 12, lineHeight: 1.5 }}>
              Permanently delete your workspace and all data. This cannot be undone.
            </div>
            <button
              onClick={fire}
              style={{
                height: 32,
                padding: "0 14px",
                fontSize: 12.5,
                color: "#ff9089",
                background: "rgba(155,28,31,0.12)",
                border: "1px solid rgba(255,75,62,0.2)",
                borderRadius: 7,
                cursor: "not-allowed",
                opacity: 0.6,
              }}
            >
              Delete account
            </button>
          </div>
        </Section>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}
