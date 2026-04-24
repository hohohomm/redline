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
  const [feeAfterDays, setFeeAfterDays] = useState(
    initialSettings.late_fee_after_days,
  );
  const [saved, setSaved] = useState(false);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        late_fee_type: feeType,
        late_fee_value: feeValue,
        late_fee_after_days: feeAfterDays,
      }),
    });

    if (response.ok) {
      setSaved(true);
    }
  }

  return (
    <form onSubmit={saveSettings} className="max-w-2xl space-y-7">
      <div>
        <p className="mb-3 text-sm text-stone-500">rules</p>
        <h1 className="text-5xl font-bold tracking-[-0.055em] text-[#f5f1ea]">
          Late <span className="gradient-text">fees.</span>
        </h1>
        <p className="mt-3 text-stone-400">
          Choose when Redline adds pressure.
        </p>
      </div>

      <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-stone-300">Fee type</legend>
          <label className="flex items-center gap-3 text-stone-300">
            <input
              type="radio"
              name="late_fee_type"
              value="percent"
              checked={feeType === "percent"}
              onChange={() => setFeeType("percent")}
            />
            Percent
          </label>
          <label className="flex items-center gap-3 text-stone-300">
            <input
              type="radio"
              name="late_fee_type"
              value="flat"
              checked={feeType === "flat"}
              onChange={() => setFeeType("flat")}
            />
            Flat
          </label>
        </fieldset>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-300">Fee value</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={feeValue}
            onChange={(event) => setFeeValue(Number(event.target.value))}
            className="h-11 w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-[#f5f1ea] outline-none focus:ring-2 focus:ring-[#ff4b3e]/50"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-300">
            Add fee after days
          </span>
          <input
            type="number"
            min="1"
            value={feeAfterDays}
            onChange={(event) => setFeeAfterDays(Number(event.target.value))}
            className="h-11 w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-[#f5f1ea] outline-none focus:ring-2 focus:ring-[#ff4b3e]/50"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-[18px] bg-[#ff4b3e] px-6 py-3 font-medium text-white shadow-[0_18px_42px_rgba(255,75,62,0.22)] transition hover:-translate-y-0.5">
          Save settings
        </button>
        {saved && <p className="text-sm text-stone-400">Saved.</p>}
      </div>
    </form>
  );
}
