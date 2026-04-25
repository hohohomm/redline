"use client";

import { useState } from "react";

type SettingsFormProps = {
  initialSettings: {
    late_fee_type: "percent" | "flat";
    late_fee_value: number;
    late_fee_after_days: number;
  };
};

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [feeType, setFeeType] = useState(initialSettings.late_fee_type);
  const [feeValue, setFeeValue] = useState(initialSettings.late_fee_value);
  const [feeAfterDays, setFeeAfterDays] = useState(initialSettings.late_fee_after_days);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        late_fee_type: feeType,
        late_fee_value: feeValue,
        late_fee_after_days: feeAfterDays,
      }),
    });

    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={saveSettings} style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>
          Fee type
          <select value={feeType} onChange={(event) => setFeeType(event.target.value as "percent" | "flat")} style={inputStyle}>
            <option value="percent">Percent</option>
            <option value="flat">Flat fee</option>
          </select>
        </label>
        <label style={labelStyle}>
          Fee value
          <input
            type="number"
            min="0"
            step="0.01"
            value={feeValue}
            onChange={(event) => setFeeValue(Number(event.target.value))}
            style={inputStyle}
          />
        </label>
      </div>
      <label style={labelStyle}>
        Add fee after days
        <input
          type="number"
          min="1"
          value={feeAfterDays}
          onChange={(event) => setFeeAfterDays(Number(event.target.value))}
          style={inputStyle}
        />
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" disabled={status === "saving"} style={buttonStyle}>
          {status === "saving" ? "Saving..." : "Save late-fee rules"}
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
