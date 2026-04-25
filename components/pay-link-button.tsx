"use client";

import { useState } from "react";

type PayLinkStatus = "idle" | "loading" | "copied" | "error";

export function PayLinkButton({ invoiceId }: { invoiceId: string }) {
  const [status, setStatus] = useState<PayLinkStatus>("idle");

  async function handleClick() {
    setStatus("loading");

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay-link`, {
        method: "POST",
      });
      const data = await response.json();

      if (!data.url) {
        throw new Error("no url");
      }

      await navigator.clipboard.writeText(data.url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  let label = "Copy pay link";
  if (status === "loading") label = "...";
  if (status === "copied") label = "Copied!";
  if (status === "error") label = "Failed";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      style={{
        color: "#ff7468",
        cursor: status === "loading" ? "wait" : "pointer",
        fontSize: 12,
        opacity: status === "loading" ? 0.7 : 1,
      }}
    >
      {label}
    </button>
  );
}
