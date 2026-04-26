"use client";

import { useState } from "react";

export type BusinessSettings = {
  business_name: string | null;
  business_email: string | null;
  abn: string | null;
  default_payment_terms: string;
  reminder_tone: "Friendly" | "Direct" | "Firm";
};

const TERMS_OPTIONS = ["Due on receipt", "Net 7", "Net 14", "Net 30", "Net 60"];
const TONE_OPTIONS: BusinessSettings["reminder_tone"][] = ["Friendly", "Direct", "Firm"];

export function BusinessSettingsForm({ initial }: { initial: BusinessSettings }) {
  const [businessName, setBusinessName] = useState(initial.business_name ?? "");
  const [businessEmail, setBusinessEmail] = useState(initial.business_email ?? "");
  const [abn, setAbn] = useState(initial.abn ?? "");
  const [terms, setTerms] = useState(initial.default_payment_terms);
  const [tone, setTone] = useState<BusinessSettings["reminder_tone"]>(initial.reminder_tone);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const response = await fetch("/api/settings/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: businessName.trim() || null,
        business_email: businessEmail.trim() || null,
        abn: abn.trim() || null,
        default_payment_terms: terms,
        reminder_tone: tone,
      }),
    });

    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>
          Business name
          <input
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Your Studio"
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Business email
          <input
            type="email"
            value={businessEmail}
            onChange={(event) => setBusinessEmail(event.target.value)}
            placeholder="hello@yourstudio.com"
            style={inputStyle}
          />
        </label>
      </div>
      <label style={labelStyle}>
        ABN (Australian Business Number)
        <input
          type="text"
          value={abn}
          onChange={(event) => setAbn(event.target.value)}
          placeholder="12 345 678 901"
          style={inputStyle}
        />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>
          Default payment terms
          <select value={terms} onChange={(event) => setTerms(event.target.value)} style={inputStyle}>
            {TERMS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Reminder tone
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as BusinessSettings["reminder_tone"])}
            style={inputStyle}
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" disabled={status === "saving"} style={buttonStyle}>
          {status === "saving" ? "Saving..." : "Save business details"}
        </button>
        {status === "saved" && <span style={{ color: "var(--ash)", fontSize: 12 }}>Saved.</span>}
        {status === "error" && <span style={{ color: "#ff7468", fontSize: 12 }}>Save failed.</span>}
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 7,
  color: "var(--ash)",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--hair)",
  borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  color: "var(--warm-white)",
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "#ff4b3e",
  color: "white",
  fontSize: 13,
  fontWeight: 500,
};
