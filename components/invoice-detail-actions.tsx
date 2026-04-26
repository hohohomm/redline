"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "draft" | "sent" | "paid" | "overdue" | "void";

export function InvoiceDetailActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "send" | "paid" | "copy" | "delete">(null);
  const [message, setMessage] = useState<string>("");

  async function send() {
    setMessage("");
    setBusy("send");
    const response = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
    setBusy(null);
    setMessage(response.ok ? "Sent." : "Send failed.");
    if (response.ok) router.refresh();
  }

  async function markPaid() {
    setMessage("");
    setBusy("paid");
    const response = await fetch(`/api/invoices/${id}/mark-paid`, { method: "POST" });
    setBusy(null);
    setMessage(response.ok ? "Marked paid." : "Update failed.");
    if (response.ok) router.refresh();
  }

  async function copyPayLink() {
    setMessage("");
    setBusy("copy");
    const response = await fetch(`/api/invoices/${id}/pay-link`, { method: "POST" });
    const body = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok || !body.url) {
      setMessage("Pay link failed.");
      return;
    }
    await navigator.clipboard.writeText(body.url);
    setMessage("Pay link copied.");
  }

  async function remove() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setMessage("");
    setBusy("delete");
    const response = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setBusy(null);
    if (response.ok) {
      router.push("/dashboard/invoices");
      return;
    }
    setMessage("Delete failed.");
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <button
        onClick={send}
        disabled={busy !== null || status === "paid"}
        style={btnStyle("primary", busy === "send")}
      >
        {busy === "send" ? "Sending..." : "Send now"}
      </button>
      {status !== "paid" && (
        <button
          onClick={markPaid}
          disabled={busy !== null}
          style={btnStyle("secondary", busy === "paid")}
        >
          {busy === "paid" ? "Saving..." : "Mark paid"}
        </button>
      )}
      <button
        onClick={copyPayLink}
        disabled={busy !== null}
        style={btnStyle("ghost", busy === "copy")}
      >
        {busy === "copy" ? "Copying..." : "Copy pay link"}
      </button>
      <button
        onClick={remove}
        disabled={busy !== null}
        style={btnStyle("danger", busy === "delete")}
      >
        {busy === "delete" ? "Deleting..." : "Delete"}
      </button>
      {message && (
        <span style={{ fontSize: 12, color: "var(--ash)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
          {message}
        </span>
      )}
    </div>
  );
}

function btnStyle(variant: "primary" | "secondary" | "ghost" | "danger", loading: boolean): React.CSSProperties {
  const v = {
    primary: { bg: "linear-gradient(180deg,#ff4b3e 0%,#d8352a 100%)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
    secondary: { bg: "rgba(255,255,255,0.04)", color: "var(--warm-white)", border: "1px solid var(--hair-strong, var(--hair))" },
    ghost: { bg: "transparent", color: "var(--ash)", border: "1px solid var(--hair)" },
    danger: { bg: "rgba(155,28,31,0.12)", color: "#ff9089", border: "1px solid rgba(255,75,62,0.2)" },
  }[variant];
  return {
    height: 36,
    padding: "0 14px",
    fontSize: 13,
    borderRadius: 8,
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.7 : 1,
    background: v.bg,
    color: v.color,
    border: v.border,
    letterSpacing: "-0.005em",
  };
}
