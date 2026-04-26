"use client";

import { useMemo, useState } from "react";

export function ReferralShare({ code, referralCount }: { code: string; referralCount: number }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/r/${code}`;
    return `${window.location.origin}/r/${code}`;
  }, [code]);

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ color: "var(--ash)", fontSize: 11 }}>Your referral link</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            border: "1px solid var(--hair)",
            borderRadius: 8,
            background: "rgba(255,255,255,0.02)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--warm-white-dim)",
            overflow: "hidden",
          }}
        >
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={copy}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              background: copied ? "rgba(126,192,138,0.15)" : "#ff4b3e",
              color: copied ? "#9fd3aa" : "#fff",
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ color: "var(--ash)", fontSize: 11 }}>Signups from your link</div>
        <div style={{ fontSize: 22, fontFamily: "var(--font-mono)", color: referralCount > 0 ? "#9fd3aa" : "var(--warm-white)" }}>
          {referralCount}
        </div>
      </div>
    </div>
  );
}
