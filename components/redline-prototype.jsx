"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";



const BrandMark = ({ size = 32, glow = false }) => {
  const r = Math.max(4, size * 0.22);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "var(--graphite-900) url('/assets/redline-icon.png') center / cover no-repeat",
        boxShadow: glow
          ? "0 0 0 1px rgba(255,255,255,0.08), 0 10px 30px -10px rgba(255,58,48,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
        overflow: "hidden",
        flexShrink: 0,
        display: "inline-block",
      }}
      aria-hidden="true"
    />
  );
};

const WordMark = ({ size = 18 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: Math.round(size * 0.5),
      fontSize: size,
      fontWeight: 500,
      letterSpacing: "-0.02em",
      color: "var(--warm-white)",
    }}
  >
    <BrandMark size={Math.round(size * 1.55)} />
    <span>Redline</span>
  </div>
);

// OperatorBadge — tiny mascot presence. Circular crop, warm treatment.
const OperatorBadge = ({ size = 28, status = "idle", label }) => {
  const statusColors = {
    idle: "#7ec08a",
    working: "#ff4b3e",
    sending: "#e8c07c",
  };
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        aria-label="Rei"
        role="img"
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#0c0d11",
          boxShadow: "0 0 0 1.5px #ff4b3e, 0 0 14px rgba(255,75,62,0.45)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-monospace, monospace",
          fontSize: Math.round(size * 0.42),
          fontWeight: 600,
          color: "#ff6a5a",
          letterSpacing: "-0.04em",
          textShadow: "0 0 8px rgba(255,75,62,0.6)",
        }}
      >
        R
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 60% at 50% 40%, transparent 60%, rgba(8,9,11,0.35) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
      {status && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: statusColors[status] || statusColors.idle,
            boxShadow: `0 0 8px ${statusColors[status] || statusColors.idle}`,
            animation: status === "working" ? "rl-pulse 1.6s ease-in-out infinite" : "rl-breathe 2.4s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
      )}
      {label && (
        <span
          style={{
            fontSize: 12,
            color: "var(--ash)",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};




// Shared UI primitives — Button, Input, Panel, Chip, etc.

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  onClick,
  type = "button",
  disabled,
  loading,
  full,
  style: extraStyle = {},
  ...rest
}) => {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const sizes = {
    sm: { h: 30, px: 12, fs: 12.5, gap: 6, r: 8 },
    md: { h: 38, px: 16, fs: 13.5, gap: 8, r: 9 },
    lg: { h: 46, px: 20, fs: 14.5, gap: 10, r: 10 },
  }[size];

  const variants = {
    primary: {
      bg: hover
        ? "linear-gradient(180deg, #ff5e52 0%, #e83a2e 100%)"
        : "linear-gradient(180deg, #ff4b3e 0%, #d8352a 100%)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.1)",
      shadow: hover
        ? "0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 0 3px rgba(255,75,62,0.22), 0 12px 36px -8px rgba(255,58,48,0.5)"
        : "0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 0 0px rgba(255,75,62,0.22), 0 8px 20px -8px rgba(255,58,48,0.4)",
    },
    secondary: {
      bg: hover ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
      color: "var(--warm-white)",
      border: "1px solid var(--hair)",
      shadow: "none",
    },
    ghost: {
      bg: hover ? "rgba(255,255,255,0.04)" : "transparent",
      color: "var(--warm-white)",
      border: "1px solid transparent",
      shadow: "none",
    },
    danger: {
      bg: hover ? "rgba(155,28,31,0.2)" : "rgba(155,28,31,0.12)",
      color: "#ff9089",
      border: "1px solid rgba(255,75,62,0.2)",
      shadow: "none",
    },
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        height: sizes.h,
        padding: `0 ${sizes.px}px`,
        fontSize: sizes.fs,
        fontWeight: variant === "primary" ? 500 : 450,
        letterSpacing: "-0.01em",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.gap,
        width: full ? "100%" : "auto",
        background: variants.bg,
        color: variants.color,
        border: variants.border,
        borderRadius: sizes.r,
        boxShadow: variants.shadow,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: pressed ? "translateY(1px)" : hover ? "translateY(-1px)" : "none",
        transition: "transform 180ms var(--ease-out), box-shadow 240ms var(--ease-out), background 200ms var(--ease-out)",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      {...rest}
    >
      {loading ? (
        <Spinner size={sizes.fs} />
      ) : (
        <>
          {icon}
          {children}
          {iconRight}
        </>
      )}
    </button>
  );
};

const Spinner = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "rl-spin 0.8s linear infinite" }}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" fill="none" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

const Input = ({
  label,
  hint,
  error,
  prefix,
  suffix,
  full = true,
  size = "md",
  style: extraStyle = {},
  ...rest
}) => {
  const [focus, setFocus] = React.useState(false);
  const heights = { sm: 34, md: 40, lg: 48 };
  const h = heights[size];
  return (
    <label
      style={{
        display: "block",
        width: full ? "100%" : "auto",
      }}
    >
      {label && (
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 500,
            color: "var(--ash)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: h,
          background: focus ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${error ? "rgba(255,75,62,0.5)" : focus ? "rgba(255,255,255,0.18)" : "var(--hair)"}`,
          borderRadius: 9,
          padding: "0 12px",
          transition: "all 180ms var(--ease-out)",
          boxShadow: focus
            ? "0 0 0 4px rgba(255,75,62,0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "inset 0 1px 0 rgba(255,255,255,0.02)",
          ...extraStyle,
        }}
      >
        {prefix && (
          <span style={{ color: "var(--ash)", fontSize: 13, marginRight: 8, display: "inline-flex" }}>
            {prefix}
          </span>
        )}
        <input
          {...rest}
          onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13.5,
            color: "var(--warm-white)",
            letterSpacing: "-0.01em",
            height: "100%",
            minWidth: 0,
          }}
        />
        {suffix && (
          <span style={{ color: "var(--ash)", fontSize: 13, marginLeft: 8 }}>
            {suffix}
          </span>
        )}
      </div>
      {(hint || error) && (
        <div
          style={{
            fontSize: 11.5,
            color: error ? "#ff7468" : "var(--ash-dim)",
            marginTop: 6,
            letterSpacing: "-0.005em",
          }}
        >
          {error || hint}
        </div>
      )}
    </label>
  );
};

const Panel = ({ children, style = {}, padded = true, ...rest }) => (
  <div
    style={{
      background: "linear-gradient(180deg, rgba(22,24,31,0.9) 0%, rgba(12,13,17,0.9) 100%)",
      border: "1px solid var(--hair)",
      borderRadius: 14,
      padding: padded ? 20 : 0,
      boxShadow: "var(--shadow-panel)",
      backdropFilter: "blur(8px)",
      position: "relative",
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const Chip = ({ children, tone = "neutral", icon, size = "md" }) => {
  const tones = {
    neutral: { bg: "rgba(255,255,255,0.04)", color: "var(--ash)", border: "var(--hair)" },
    red: { bg: "rgba(255,75,62,0.1)", color: "#ff7468", border: "rgba(255,75,62,0.25)" },
    ok: { bg: "rgba(126,192,138,0.1)", color: "#9fd3aa", border: "rgba(126,192,138,0.25)" },
    amber: { bg: "rgba(232,192,124,0.1)", color: "#f0ce93", border: "rgba(232,192,124,0.25)" },
    dark: { bg: "rgba(8,9,11,0.6)", color: "var(--warm-white-dim)", border: "var(--hair)" },
  };
  const t = tones[tone];
  const s = size === "sm" ? { h: 20, px: 7, fs: 10.5 } : { h: 24, px: 9, fs: 11.5 };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: s.h,
        padding: `0 ${s.px}px`,
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        borderRadius: 999,
        fontSize: s.fs,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {children}
    </span>
  );
};

const Kbd = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--ash)",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid var(--hair)",
      borderRadius: 4,
      letterSpacing: 0,
    }}
  >
    {children}
  </span>
);

// Icons — minimal, 1.5 stroke
const Icon = {
  arrow: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mail: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  bolt: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  clock: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  dollar: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  plus: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  minus: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  x: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  home: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  doc: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  user: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  cog: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.32.23.67.26 1.03" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  trend: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m3 17 6-6 4 4 8-8M14 7h7v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  send: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m22 2-11 11M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  sparkle: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  bell: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 3h16l-2-3ZM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  copy: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6"/></svg>,
  link: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  card: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M2 10h20" stroke="currentColor" strokeWidth="1.6"/></svg>,
  shield: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2 4 5v7c0 5 3.5 9 8 10 4.5-1 8-5 8-10V5l-8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  chev: ({ s = 14, dir = "down" }) => {
    const rot = { down: 0, up: 180, left: 90, right: -90 }[dir];
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rot}deg)` }}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  },
  more: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>,
  filter: ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
};



// ReminderTimeline — escalation stages from send → 1st nudge → firmer → late fee → paid.
// Used inside the landing hero's product preview.

const REMINDER_STAGES = [
  { id: "sent", label: "Invoice sent", tone: "ok", when: "Day 0", copy: "Payment link delivered. Read at 09:12.", voice: "clean hand-off" },
  { id: "friendly", label: "Friendly reminder", tone: "amber", when: "7d overdue", copy: "\"Quick heads up — here's the payment link again.\"", voice: "friendly reminder" },
  { id: "direct", label: "Direct reminder", tone: "amber", when: "14d overdue", copy: "\"This one is still open. Can you settle today?\"", voice: "direct, not cold" },
  { id: "fee", label: "Late-fee notice", tone: "red", when: "21d overdue", copy: "Fee applied per your settings. Client notified.", voice: "operational" },
  { id: "final", label: "Final notice", tone: "red", when: "30d overdue", copy: "Final collection notice sent with payment link.", voice: "firm" },
  { id: "paid", label: "Marked paid", tone: "ok", when: "—", copy: "Thanks sent. Thread archived.", voice: "done" },
];

const Dot = ({ tone = "ash", active, pulse }) => {
  const colors = {
    ok: "#7ec08a",
    amber: "#e8c07c",
    red: "#ff4b3e",
    ash: "#4a4a4e",
  };
  const c = colors[tone] || colors.ash;
  return (
    <div
      style={{
        position: "relative",
        width: 10,
        height: 10,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: active ? c : "rgba(255,255,255,0.08)",
          border: `1px solid ${active ? c : "rgba(255,255,255,0.15)"}`,
          boxShadow: active ? `0 0 10px ${c}` : "none",
          transition: "all 300ms var(--ease-out)",
        }}
      />
      {pulse && active && (
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: `1px solid ${c}`,
            animation: "rl-ring 1.6s ease-out infinite",
          }}
        />
      )}
    </div>
  );
};

const ReminderTimeline = ({ step = 0, compact = false }) => {
  return (
    <div style={{ position: "relative" }}>
      {/* vertical line */}
      <div
        style={{
          position: "absolute",
          left: 4,
          top: 10,
          bottom: 10,
          width: 1,
          background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
        }}
      />
      {/* filled progress line */}
      <div
        style={{
          position: "absolute",
          left: 4,
          top: 10,
          height: `calc(${(step / (REMINDER_STAGES.length - 1)) * 100}% - 20px)`,
          width: 1,
          background: "linear-gradient(180deg, rgba(255,75,62,0.6), rgba(255,75,62,0.2))",
          transition: "height 520ms var(--ease-out)",
        }}
      />
      {REMINDER_STAGES.map((s, i) => {
        const done = i < step;
        const current = i === step;
        const future = i > step;
        return (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: compact ? "8px 0" : "10px 0",
              opacity: future ? 0.4 : 1,
              transition: "opacity 320ms var(--ease-out)",
              position: "relative",
            }}
          >
            <div style={{ marginTop: 4 }}>
              <Dot tone={done || current ? s.tone : "ash"} active={done || current} pulse={current} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: current ? "var(--warm-white)" : done ? "var(--warm-white-dim)" : "var(--ash)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    color: "var(--ash-dim)",
                    letterSpacing: 0,
                    flexShrink: 0,
                  }}
                >
                  {s.when}
                </div>
              </div>
              {!compact && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ash)",
                    lineHeight: 1.5,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {s.copy}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};



// ProductPreview — the interactive invoice card on the landing page.
// Click "Send reminder" to advance the timeline. Click "Mark paid" to resolve.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProductPreview = () => {
  const [step, setStep] = React.useState(1);
  const [marking, setMarking] = React.useState(false);
  const [paid, setPaid] = React.useState(false);
  const [flash, setFlash] = React.useState(null);
  const maxStep = REMINDER_STAGES.length - 2; // up to "fee", "paid" via button

  const sendReminder = () => {
    if (paid) return;
    if (step < maxStep) {
      setStep(step + 1);
      setFlash(`Reminder queued — ${REMINDER_STAGES[step + 1].label.toLowerCase()}`);
      setTimeout(() => setFlash(null), 2200);
    }
  };

  const markPaid = () => {
    if (paid) return;
    setMarking(true);
    setTimeout(() => {
      setStep(REMINDER_STAGES.length - 1);
      setPaid(true);
      setMarking(false);
      setFlash("Marked paid. Thread archived.");
      setTimeout(() => setFlash(null), 2600);
    }, 650);
  };

  const reset = () => {
    setStep(1);
    setPaid(false);
    setFlash("Demo reset.");
    setTimeout(() => setFlash(null), 1400);
  };

  const statusChip = paid ? (
    <Chip tone="ok" icon={<Icon.check s={10} />}>Paid</Chip>
  ) : step >= 3 ? (
    <Chip tone="red">Overdue · {step - 2}d late</Chip>
  ) : step >= 1 ? (
    <Chip tone="amber">Awaiting payment</Chip>
  ) : (
    <Chip tone="neutral">Draft</Chip>
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "grid",
        gap: 14,
      }}
    >
      {/* Invoice card */}
      <Panel padded={false} style={{ overflow: "hidden" }}>
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderBottom: "1px solid var(--hair)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div
            style={{
              flex: 1,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ash-dim)",
              textAlign: "center",
              letterSpacing: 0,
            }}
          >
            redline.app / invoices / inv-0247
          </div>
          <OperatorBadge size={20} status={paid ? "idle" : "working"} />
        </div>

        {/* Invoice summary */}
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-dim)", letterSpacing: 0.5 }}>INV-0247</span>
                {statusChip}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
                Harbor Studio
              </div>
              <div style={{ fontSize: 12, color: "var(--ash)", marginTop: 2 }}>
                ops@harborstudio.co · Net 10
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-dim)", letterSpacing: 0.5, marginBottom: 4 }}>AMOUNT DUE</div>
              <div style={{ fontSize: 24, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", fontWeight: 500 }}>
                ${paid ? "0.00" : step >= 4 ? "2,517.53" : "2,480.00"}
              </div>
              {!paid && step >= 4 && (
                <div style={{ fontSize: 10.5, color: "#ff7468", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  incl. $37.53 late fee
                </div>
              )}
            </div>
          </div>

          {/* Line items */}
          <div
            style={{
              border: "1px solid var(--hair)",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {[
              { d: "Brand system — Phase 2", q: 1, u: 1800 },
              { d: "Landing copy pass", q: 1, u: 520 },
              { d: "Revisions (2h)", q: 2, u: 80 },
            ].map((li, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 14,
                  padding: "9px 12px",
                  fontSize: 12,
                  borderTop: i === 0 ? "none" : "1px solid var(--hair-soft)",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "var(--warm-white-dim)" }}>{li.d}</div>
                <div style={{ color: "var(--ash)", fontFamily: "var(--font-mono)", fontSize: 11 }}>×{li.q}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, width: 74, textAlign: "right" }}>
                  ${(li.q * li.u).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div
            style={{
              fontSize: 11,
              color: "var(--ash-dim)",
              fontFamily: "var(--font-mono)",
              letterSpacing: 0.5,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>FOLLOW-UP SEQUENCE</span>
            <span style={{ color: "var(--ash)", textTransform: "none", letterSpacing: 0 }}>
              {paid ? "complete" : `stage ${step + 1} of ${REMINDER_STAGES.length}`}
            </span>
          </div>
          <div style={{ paddingLeft: 2 }}>
            <ReminderTimeline step={step} />
          </div>
        </div>

        {/* Action bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 14px",
            borderTop: "1px solid var(--hair)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon.send s={12} />}
            onClick={sendReminder}
            disabled={paid || step >= maxStep}
          >
            Send next reminder
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Icon.check s={12} />}
            onClick={markPaid}
            loading={marking}
            disabled={paid}
          >
            Mark paid
          </Button>
          <div style={{ flex: 1 }} />
          <button
            onClick={reset}
            style={{
              fontSize: 11,
              color: "var(--ash-dim)",
              padding: "6px 8px",
              borderRadius: 6,
              letterSpacing: "-0.005em",
            }}
          >
            Reset demo
          </button>
        </div>

        {/* Flash */}
        {flash && (
          <div
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: 62,
              padding: "8px 12px",
              background: "rgba(8,9,11,0.92)",
              border: "1px solid var(--hair-strong)",
              borderRadius: 8,
              fontSize: 11.5,
              color: "var(--warm-white-dim)",
              letterSpacing: "-0.005em",
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "rl-fade-up 300ms var(--ease-out)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff4b3e", boxShadow: "0 0 8px #ff4b3e" }} />
            {flash}
          </div>
        )}
      </Panel>

      {/* Helper strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4px",
          fontSize: 11.5,
          color: "var(--ash-dim)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#ff4b3e",
              boxShadow: "0 0 8px #ff4b3e",
              animation: "rl-pulse 1.8s ease-in-out infinite",
            }}
          />
          Live demo — try the buttons
        </span>
        <span>
          <Kbd>R</Kbd> reset · <Kbd>Space</Kbd> send
        </span>
      </div>
    </div>
  );
};



// Landing page — hero with video bg + live product preview on right.

const LandingNav = ({ onNav }) => {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(8,9,11,0.6)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--hair)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <WordMark size={16} />
        <nav style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--ash)" }}>
          <a href="#how" style={{ letterSpacing: "-0.01em" }}>How it works</a>
          <a href="#sequence" style={{ letterSpacing: "-0.01em" }}>Follow-ups</a>
          <a href="#pricing" style={{ letterSpacing: "-0.01em" }}>Pricing</a>
          <a href="#faq" style={{ letterSpacing: "-0.01em" }}>FAQ</a>
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Button variant="ghost" size="sm" onClick={() => onNav("login")}>Sign in</Button>
        <Button variant="primary" size="sm" onClick={() => onNav("login")} iconRight={<Icon.arrow s={12} />}>
          Start free
        </Button>
      </div>
    </div>
  );
};

const HeroSection = ({ onNav }) => {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "780px",
        padding: "118px 28px 132px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Video background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <video
          src="/assets/redline-login-loop.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "126%",
            height: "126%",
            objectFit: "cover",
            opacity: 0.68,
            filter: "saturate(1.16) contrast(1.08)",
          }}
        />
        {/* multi-layer overlay for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(78% 64% at 30% 42%, rgba(8,9,11,0.22) 0%, rgba(8,9,11,0.72) 72%, #08090b 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8,9,11,0.16) 0%, rgba(8,9,11,0) 40%, rgba(8,9,11,0.94) 100%)",
          }}
        />
        {/* red sweep */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: 0,
            width: "60%",
            height: "160%",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(255,58,48,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "rl-sweep 14s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1420,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1080px)",
          gap: 60,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        {/* Left — headline */}
        <div style={{ animation: "rl-fade-up 600ms var(--ease-out)" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px 5px 6px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--hair)",
              borderRadius: 999,
              fontSize: 11.5,
              color: "var(--ash)",
              marginBottom: 28,
              letterSpacing: "-0.005em",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(255,75,62,0.12)",
                color: "#ff7468",
              }}
            >
              <Icon.bolt s={10} />
            </span>
            Beta · invite only
          </div>

          <h1
            style={{
              fontSize: "clamp(58px, 8.4vw, 112px)",
              fontWeight: 500,
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
              margin: 0,
              marginBottom: 22,
              color: "var(--warm-white)",
            }}
          >
            Get paid without
            <br />
            <span style={{ position: "relative", display: "inline-block" }}>
              chasing.
              <svg
                viewBox="0 0 280 16"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -4,
                  width: "100%",
                  height: 12,
                  pointerEvents: "none",
                }}
              >
                <path
                  d="M4 10 C 70 4, 140 4, 276 9"
                  stroke="#ff4b3e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    strokeDasharray: 320,
                    strokeDashoffset: 320,
                    animation: "rl-draw 1.2s var(--ease-out) 0.6s forwards",
                  }}
                />
              </svg>
            </span>
          </h1>

          <p
            style={{
              fontSize: 20,
              color: "var(--ash)",
              lineHeight: 1.55,
              maxWidth: 660,
              margin: 0,
              marginBottom: 34,
              letterSpacing: "-0.01em",
            }}
          >
            Redline sends the invoice, watches the inbox, and follows up for you.
            Friendly first, firmer later. You just see who paid.
          </p>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 38 }}>
            <Button variant="primary" size="lg" onClick={() => onNav("login")} iconRight={<Icon.arrow s={14} />}>
              Send your first invoice
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNav("login")}>
              See the dashboard
            </Button>
          </div>

          {/* Operator mascot card — small, subtle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px 10px 10px",
              background: "rgba(22,24,31,0.6)",
              border: "1px solid var(--hair)",
              borderRadius: 999,
              backdropFilter: "blur(8px)",
              maxWidth: 440,
            }}
          >
            <OperatorBadge size={32} status="working" />
            <div style={{ fontSize: 12.5, color: "var(--ash)", lineHeight: 1.4, letterSpacing: "-0.005em" }}>
              <span style={{ color: "var(--warm-white-dim)", fontWeight: 500 }}>Rei</span> is watching
              <span style={{ color: "var(--warm-white-dim)" }}> 14 open invoices</span> for you.
              Next nudge goes out in 2h.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BenefitsStrip = () => {
  const items = [
    { icon: <Icon.mail s={14} />, label: "Fewer awkward follow-ups" },
    { icon: <Icon.bolt s={14} />, label: "Automated escalation" },
    { icon: <Icon.link s={14} />, label: "One-tap payment links" },
    { icon: <Icon.dollar s={14} />, label: "Auto late fees" },
    { icon: <Icon.trend s={14} />, label: "Cashflow at a glance" },
  ];
  return (
    <section
      style={{
        borderTop: "1px solid var(--hair)",
        borderBottom: "1px solid var(--hair)",
        background: "rgba(12,13,17,0.4)",
        padding: "22px 28px",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 28,
          flexWrap: "wrap",
        }}
      >
        {items.map((it, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--warm-white-dim)", letterSpacing: "-0.01em" }}>
              <span style={{ color: "#ff7468", display: "inline-flex" }}>{it.icon}</span>
              {it.label}
            </div>
            {i < items.length - 1 && (
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ash-deep)" }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      n: "01",
      title: "Send it once.",
      body: "Build an invoice in 30 seconds. Redline drops a payment link into the email and the thread tracks itself.",
      mock: <MockSendCard />,
    },
    {
      n: "02",
      title: "Let Rei handle the follow-up.",
      body: "Your operator starts at 7 days overdue, escalates at 14, applies your late-fee rule at 21, and sends final notice at 30.",
      mock: <MockSequenceCard />,
    },
    {
      n: "03",
      title: "See what's moving.",
      body: "One dashboard. Overdue in red, paid in warm white, what's queued to send next in plain language.",
      mock: <MockCashflowCard />,
    },
  ];
  return (
    <section id="how" style={{ padding: "128px 28px 88px", position: "relative" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 56 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#ff7468", letterSpacing: 1, marginBottom: 14 }}>
            HOW IT WORKS
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, marginBottom: 16 }}>
            Three steps. No <RailUnderline>chasing</RailUnderline>.
          </h2>
          <p style={{ fontSize: 16, color: "var(--ash)", lineHeight: 1.55, margin: 0, letterSpacing: "-0.01em" }}>
            You do the work. Redline handles the awkward part — getting paid for it.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="how-grid">
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                position: "relative",
                padding: 24,
                background: "linear-gradient(180deg, rgba(22,24,31,0.7) 0%, rgba(12,13,17,0.7) 100%)",
                border: "1px solid var(--hair)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ash-dim)",
                    letterSpacing: 1,
                  }}
                >
                  {s.n}
                </span>
                <Chip tone="dark" size="sm">step {s.n}</Chip>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 500, margin: 0, marginBottom: 6, letterSpacing: "-0.02em" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13.5, color: "var(--ash)", margin: 0, lineHeight: 1.55, letterSpacing: "-0.005em" }}>
                  {s.body}
                </p>
              </div>
              <div style={{ marginTop: "auto" }}>{s.mock}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MockSendCard = () => (
  <div style={{ border: "1px solid var(--hair)", borderRadius: 10, padding: 14, background: "rgba(8,9,11,0.6)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <Icon.mail s={12} />
      <span style={{ fontSize: 11, color: "var(--ash)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
        to: ops@harborstudio.co
      </span>
    </div>
    <div style={{ fontSize: 13, color: "var(--warm-white-dim)", letterSpacing: "-0.01em", marginBottom: 10 }}>
      Here&apos;s the invoice for Phase 2. Link below pays in one tap.
    </div>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        background: "rgba(255,75,62,0.1)",
        border: "1px solid rgba(255,75,62,0.25)",
        borderRadius: 8,
        fontSize: 11.5,
        color: "#ff7468",
      }}
    >
      <Icon.link s={11} />
      pay.redline.app/inv-0247
    </div>
  </div>
);

const MockSequenceCard = () => (
  <div style={{ border: "1px solid var(--hair)", borderRadius: 10, padding: 14, background: "rgba(8,9,11,0.6)" }}>
    <ReminderTimeline step={2} compact />
  </div>
);

const MockCashflowCard = () => {
  const bars = [
    { label: "Mon", h: 40, tone: "ok" },
    { label: "Tue", h: 70, tone: "ok" },
    { label: "Wed", h: 55, tone: "amber" },
    { label: "Thu", h: 90, tone: "ok" },
    { label: "Fri", h: 62, tone: "red" },
    { label: "Sat", h: 38, tone: "ok" },
    { label: "Sun", h: 75, tone: "ok" },
  ];
  const toneColor = { ok: "#7ec08a", amber: "#e8c07c", red: "#ff4b3e" };
  return (
    <div style={{ border: "1px solid var(--hair)", borderRadius: 10, padding: 14, background: "rgba(8,9,11,0.6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: "var(--ash)", fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>
          THIS WEEK
        </span>
        <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>
          $14,820
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: "100%",
                height: `${b.h}%`,
                background: `linear-gradient(180deg, ${toneColor[b.tone]}, ${toneColor[b.tone]}66)`,
                borderRadius: "3px 3px 0 0",
                opacity: 0.9,
              }}
            />
            <span style={{ fontSize: 9, color: "var(--ash-dim)", fontFamily: "var(--font-mono)" }}>{b.label[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Clean rounded-rect outline that hugs the Sequence left column.
// Follows the container bounds (via percentage viewBox + preserveAspectRatio="none").
// Two strokes (outer glow + hot inner) draw in on scroll into view; two dashed
// pulses travel along the perimeter continuously.
// Rounded-rect outline that draws as the user's scroll advances past the
// Sequence section. pathLength is driven by scrollYProgress of the parent
// section (not a one-shot inView), so the trace is physically tied to the
// reader's finger on the page. Pulses run only while the section is the
// visual focus, then quiet down.
const SequenceOutline = () => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 40%"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    mass: 0.2,
  });
  // Focus window: pulses + glow are brightest while the section is actively
  // being traced, then ease off so they don't compete with Pricing below.
  const focus = useTransform(scrollYProgress, [0.15, 0.45, 0.85, 1], [0, 1, 1, 0.2]);
  const glowFilter = useTransform(
    focus,
    (v) =>
      `drop-shadow(0 0 ${6 * v}px rgba(255,75,62,${0.45 * v})) drop-shadow(0 0 ${22 * v}px rgba(255,75,62,${0.22 * v}))`,
  );
  const outerOpacity = useTransform(focus, [0, 1], [0.04, 0.28]);
  const innerOpacity = useTransform(focus, [0, 1], [0.2, 0.95]);
  const pulseAOpacity = useTransform(focus, [0, 1], [0, 0.95]);
  const pulseBOpacity = useTransform(focus, [0, 1], [0, 0.7]);

  // rx/ry = 10 in 200-unit viewBox — matches radius of feature rows + panel.
  const rx = 10;
  const inset = 3;
  const w = 200 - inset * 2;
  const h = 200 - inset * 2;
  const d = `M ${inset + rx} ${inset} h ${w - rx * 2} a ${rx} ${rx} 0 0 1 ${rx} ${rx} v ${h - rx * 2} a ${rx} ${rx} 0 0 1 ${-rx} ${rx} h ${-(w - rx * 2)} a ${rx} ${rx} 0 0 1 ${-rx} ${-rx} v ${-(h - rx * 2)} a ${rx} ${rx} 0 0 1 ${rx} ${-rx} Z`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "-18px -18px -18px -18px",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ overflow: "visible", filter: glowFilter }}
      >
        <path d={d} fill="none" stroke="rgba(255,75,62,0.08)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        <motion.path
          d={d}
          fill="none"
          stroke="#ff4b3e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: smooth, opacity: outerOpacity }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="#ff6a5a"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: smooth, opacity: innerOpacity }}
        />
        {/* lead pulse — only visible while focused */}
        <motion.path
          d={d}
          fill="none"
          stroke="#ffd5cc"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="0.1 0.9"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -1 }}
          transition={{ strokeDashoffset: { duration: 4.2, repeat: Infinity, ease: "linear" } }}
          style={{ opacity: pulseAOpacity }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="#ff8a7a"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="0.05 0.95"
          initial={{ strokeDashoffset: -0.5 }}
          animate={{ strokeDashoffset: -1.5 }}
          transition={{ strokeDashoffset: { duration: 4.2, repeat: Infinity, ease: "linear" } }}
          style={{ opacity: pulseBOpacity }}
        />
      </motion.svg>
    </div>
  );
};

// "The Narrator" — a scroll-driven thread that reads the page with the user.
//
//   1. Spine fades in below the hero and descends the right margin.
//   2. Inside HowItWorks, RailUnderline draws a glowing stroke under the
//      word "chasing" as its own scroll window opens.
//   3. Inside SequenceDeepDive, SequenceOutline's rounded-rect is drawn by
//      the user's scroll position, not by a one-shot inView flag.
//
// Each interaction is self-contained (owns its own useScroll target). Content
// reveals settle before the interaction window opens, so the user perceives a
// natural pause-then-flourish rhythm without any scroll hijacking.
const LandingRail = () => {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.25 });

  // 100x1000 viewBox, preserveAspectRatio=none: x reads as %viewport, y as
  // %document. Spine starts at y=80 (below hero) and ends before footer.
  const spineX = 92;
  const yStart = 80;
  const yEnd = 950;

  // Spine only fills in once scroll leaves the hero, and softens before the
  // footer so it never fights the final CTA.
  const opacity = useTransform(
    smooth,
    [0.04, 0.08, 0.93, 1.0],
    [0, 1, 1, 0.35]
  );

  return (
    <div
      aria-hidden="true"
      className="landing-rail"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        {/* ghost spine — the path ahead */}
        <line
          x1={spineX}
          y1={yStart}
          x2={spineX}
          y2={yEnd}
          stroke="rgba(255,75,62,0.07)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* active outer glow */}
        <motion.line
          x1={spineX}
          y1={yStart}
          x2={spineX}
          y2={yEnd}
          stroke="#ff4b3e"
          strokeWidth="5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            pathLength: smooth,
            filter:
              "drop-shadow(0 0 8px rgba(255,75,62,0.7)) drop-shadow(0 0 26px rgba(255,75,62,0.35))",
            opacity,
          }}
        />
        {/* active inner core */}
        <motion.line
          x1={spineX}
          y1={yStart}
          x2={spineX}
          y2={yEnd}
          stroke="#ff9080"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: smooth, opacity }}
        />
      </svg>
    </div>
  );
};

// A word with a glowing underline that draws as the word scrolls into view.
// Used inside a heading; behaves like a narrator's emphasis mark.
const RailUnderline = ({ children }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 78%", "start 42%"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 1], [0, 1, 1]);
  return (
    <span
      ref={ref}
      style={{
        position: "relative",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {children}
      <motion.span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-0.08em",
          height: 3,
          background: "linear-gradient(90deg, rgba(255,75,62,0) 0%, #ff4b3e 12%, #ff9080 50%, #ff4b3e 88%, rgba(255,75,62,0) 100%)",
          borderRadius: 2,
          transformOrigin: "left center",
          scaleX,
          opacity,
          filter: "drop-shadow(0 0 6px rgba(255,75,62,0.55)) drop-shadow(0 0 16px rgba(255,75,62,0.3))",
          pointerEvents: "none",
        }}
      />
    </span>
  );
};

const SequenceDeepDive = () => {
  const [step, setStep] = React.useState(2);
  React.useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % REMINDER_STAGES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <section id="sequence" style={{ padding: "108px 28px 108px", position: "relative" }}>
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
          gap: 60,
          alignItems: "center",
        }}
        className="seq-grid"
      >
        <div style={{ position: "relative" }}>
          <SequenceOutline />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#ff7468", letterSpacing: 1, marginBottom: 14, position: "relative" }}>
            THE SEQUENCE
          </div>
          <h2 style={{ fontSize: "clamp(30px, 3.5vw, 44px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.08, margin: 0, marginBottom: 16, position: "relative" }}>
            Friendly first. Firmer later.
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--ash)", lineHeight: 1.6, margin: 0, marginBottom: 26, letterSpacing: "-0.005em", position: "relative" }}>
            Redline&apos;s default escalation is calibrated on hundreds of real invoice threads.
            You can override any step, pause the sequence with one tap, or write your own voice.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
            {[
              { k: "Tone control", v: "Pick how you want to sound — warm, neutral, or strictly business. Per client or global." },
              { k: "Pause anytime", v: "Client asked for time? Pause the thread for X days with a single click. No awkward manual emails." },
              { k: "Late fees, your way", v: "Set a flat fee or %. Redline applies and notifies exactly per your terms." },
            ].map((f, i) => (
              <motion.div
                key={f.k}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="seq-feature-row"
                style={{ display: "flex", gap: 12, padding: "12px 14px", border: "1px solid var(--hair)", borderRadius: 10, background: "rgba(22,24,31,0.4)", transition: "border-color 320ms var(--ease-out), box-shadow 320ms var(--ease-out), background 320ms var(--ease-out)" }}
              >
                <motion.div
                  className="seq-check"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(255,75,62,0)",
                      "0 0 14px 2px rgba(255,75,62,0.38)",
                      "0 0 0 0 rgba(255,75,62,0)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
                  style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,75,62,0.12)", color: "#ff7468", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <Icon.check s={14} />
                </motion.div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 2 }}>{f.k}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ash)", lineHeight: 1.5 }}>{f.v}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <Panel style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <OperatorBadge size={22} status="working" />
                <span style={{ fontSize: 12.5, color: "var(--warm-white-dim)", letterSpacing: "-0.01em" }}>Default sequence</span>
              </div>
              <Chip tone="red" size="sm">auto</Chip>
            </div>
            <ReminderTimeline step={step} />
          </Panel>
        </div>
      </div>
    </section>
  );
};

const PricingSection = ({ onNav }) => {
  const tiers = [
    {
      name: "Solo",
      price: "Free",
      period: "forever",
      body: "For your first clients.",
      features: ["Up to 3 open invoices", "Redline follow-up sequence", "Payment links"],
      cta: "Start free",
      primary: false,
    },
    {
      name: "Pro",
      price: "$18",
      period: "/ month",
      body: "For the people paying themselves.",
      features: ["Unlimited invoices", "Custom tones + pause", "Auto late fees", "Cashflow view", "Priority nudges"],
      cta: "Start 14-day trial",
      primary: true,
    },
    {
      name: "Studio",
      price: "$42",
      period: "/ month",
      body: "For small teams with clients.",
      features: ["Everything in Pro", "3 operators", "Shared client book", "CSV + Xero export"],
      cta: "Talk to us",
      primary: false,
    },
  ];
  return (
    <section id="pricing" style={{ padding: "108px 28px 100px", borderTop: "1px solid var(--hair)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#ff7468", letterSpacing: 1, marginBottom: 10 }}>
            PRICING
          </div>
          <h2 style={{ fontSize: "clamp(30px, 3.5vw, 42px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>
            One late-paying client covers it.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="pricing-grid">
          {tiers.map((t) => (
            <div
              key={t.name}
              style={{
                position: "relative",
                padding: 24,
                borderRadius: 16,
                background: t.primary
                  ? "linear-gradient(180deg, rgba(255,75,62,0.08) 0%, rgba(22,24,31,0.8) 40%)"
                  : "linear-gradient(180deg, rgba(22,24,31,0.6) 0%, rgba(12,13,17,0.6) 100%)",
                border: t.primary ? "1px solid rgba(255,75,62,0.3)" : "1px solid var(--hair)",
                boxShadow: t.primary ? "0 30px 80px -30px rgba(255,58,48,0.35)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {t.primary && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    right: 20,
                    padding: "3px 10px",
                    background: "#ff4b3e",
                    color: "#fff",
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: 0.4,
                    borderRadius: "0 0 6px 6px",
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, color: "var(--ash)", letterSpacing: "-0.005em", marginBottom: 4 }}>{t.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.03em", fontFamily: "var(--font-mono)" }}>{t.price}</span>
                  <span style={{ fontSize: 12.5, color: "var(--ash)" }}>{t.period}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ash)", letterSpacing: "-0.005em" }}>{t.body}</div>
              </div>
              <div style={{ height: 1, background: "var(--hair)" }} />
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {t.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--warm-white-dim)", letterSpacing: "-0.005em" }}>
                    <span style={{ color: "#ff7468", display: "inline-flex", marginTop: 2 }}>
                      <Icon.check s={12} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={t.primary ? "primary" : "secondary"}
                size="md"
                full
                onClick={() => onNav("login")}
              >
                {t.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FaqSection = () => {
  const faqs = [
    { q: "Will clients know it's automated?", a: "They shouldn't. Emails go from your address, your voice, your signature. Redline just picks the timing and the tone." },
    { q: "Can I pause a sequence mid-thread?", a: "Yes — one click. Pause for days or indefinitely. Resume any time." },
    { q: "What happens if a client pays partially?", a: "Redline detects the payment, updates the balance, and queues a soft reminder for the remainder only if you want it to." },
    { q: "Does it work with my existing invoice tool?", a: "Import CSV or connect via API. For most freelancers Redline is enough on its own." },
  ];
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" style={{ padding: "100px 28px 100px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#ff7468", letterSpacing: 1, marginBottom: 10, textAlign: "center" }}>
          FAQ
        </div>
        <h2 style={{ fontSize: "clamp(28px, 3vw, 36px)", fontWeight: 500, letterSpacing: "-0.03em", margin: 0, marginBottom: 34, textAlign: "center" }}>
          Things people ask before signing up.
        </h2>
        <div style={{ border: "1px solid var(--hair)", borderRadius: 14, overflow: "hidden", background: "rgba(22,24,31,0.4)" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid var(--hair-soft)" }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: "100%",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                  fontSize: 14.5,
                  fontWeight: 450,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.q}
                <span
                  style={{
                    color: "var(--ash)",
                    transform: open === i ? "rotate(180deg)" : "none",
                    transition: "transform 220ms var(--ease-out)",
                    display: "inline-flex",
                  }}
                >
                  <Icon.chev s={14} />
                </span>
              </button>
              <div
                style={{
                  maxHeight: open === i ? 120 : 0,
                  overflow: "hidden",
                  transition: "max-height 320ms var(--ease-out)",
                }}
              >
                <div style={{ padding: "0 22px 18px", fontSize: 13.5, color: "var(--ash)", lineHeight: 1.55, letterSpacing: "-0.005em" }}>
                  {f.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCta = ({ onNav }) => (
  <section style={{ padding: "100px 28px 124px", position: "relative", overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "-40%",
        transform: "translateX(-50%)",
        width: "70%",
        height: "100%",
        background: "radial-gradient(50% 50% at 50% 50%, rgba(255,58,48,0.18) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }}
    />
    <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
      <h2 style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05, margin: 0, marginBottom: 18 }}>
        Send once.
        <br />
        Redline keeps it moving.
      </h2>
      <p style={{ fontSize: 15.5, color: "var(--ash)", margin: 0, marginBottom: 28, letterSpacing: "-0.005em" }}>
        Free for your first three open invoices. No card.
      </p>
      <div style={{ display: "inline-flex", gap: 10 }}>
        <Button variant="primary" size="lg" onClick={() => onNav("login")} iconRight={<Icon.arrow s={14} />}>
          Start free
        </Button>
        <Button variant="secondary" size="lg" onClick={() => onNav("login")}>
          See the dashboard
        </Button>
      </div>
    </div>
  </section>
);

const footerLinkStyle = {
  color: "inherit",
  textDecoration: "none",
};

const LandingFooter = () => (
  <footer style={{ borderTop: "1px solid var(--hair)", padding: "28px", background: "rgba(8,9,11,0.6)" }}>
    <div
      style={{
        maxWidth: 1320,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
        fontSize: 12,
        color: "var(--ash-dim)",
      }}
    >
      <WordMark size={14} />
      <div style={{ display: "flex", gap: 22 }}>
        <a href="/contact" style={footerLinkStyle}>Contact</a>
        <a href="/privacy" style={footerLinkStyle}>Privacy</a>
        <a href="/terms" style={footerLinkStyle}>Terms</a>
        <a href="mailto:support@redlineinvoices.com" style={footerLinkStyle}>support@redlineinvoices.com</a>
      </div>
      <div>© 2026 Redline Labs</div>
    </div>
  </footer>
);

// Scroll-scrubbed reveal. Starts at opacity 0.2 (not 0) so sections never
// flash fully invisible during a fast scroll. No blur: avoids GPU cost on
// long pages and keeps type crisp while scrolling.
const ScrollReveal = ({ children }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "start 45%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [28, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y, willChange: "opacity, transform" }}>
      {children}
    </motion.div>
  );
};

const LandingPage = ({ onNav }) => {
  return (
    <div style={{ minHeight: "100vh", background: "var(--graphite-900)", color: "var(--warm-white)", position: "relative" }}>
      <LandingRail />
      <LandingNav onNav={onNav} />
      <HeroSection onNav={onNav} />
      <ScrollReveal><BenefitsStrip /></ScrollReveal>
      <ScrollReveal><HowItWorks /></ScrollReveal>
      <ScrollReveal><SequenceDeepDive /></ScrollReveal>
      <ScrollReveal><PricingSection onNav={onNav} /></ScrollReveal>
      <ScrollReveal><FaqSection /></ScrollReveal>
      <ScrollReveal><FinalCta onNav={onNav} /></ScrollReveal>
      <LandingFooter />
    </div>
  );
};



// Login page — dark magic-link form.

const LoginPage = ({ onNav }) => {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState("idle"); // idle | sending | sent | error
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);

    if (params.get("error") === "auth") {
      setError("Sign-in link expired or could not be verified. Send a new link.");
      setState("error");
    }

    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        onNav("dashboard");
      }
    });

    return () => {
      active = false;
    };
  }, [onNav]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("That email looks off. Mind checking?");
      setState("error");
      return;
    }
    setState("sending");

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error || "Could not send sign-in link.");
      setState("error");
      return;
    }

    setState("sent");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--graphite-900)",
      }}
      className="login-grid"
    >
      {/* Left — form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 40,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => onNav("landing")} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <WordMark size={15} />
          </button>
          <div style={{ fontSize: 12, color: "var(--ash-dim)" }}>
            New here?{" "}
            <a
              onClick={() => onNav("landing")}
              style={{ color: "var(--warm-white-dim)", textDecoration: "underline", textDecorationColor: "var(--hair-strong)", cursor: "pointer" }}
            >
              What is Redline?
            </a>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 400,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div style={{ marginBottom: 30, animation: "rl-fade-up 400ms var(--ease-out)" }}>
            <OperatorBadge size={36} status={state === "sending" ? "sending" : state === "sent" ? "idle" : "working"} />
          </div>

          {state !== "sent" ? (
            <>
              <h1 style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.03em", margin: 0, marginBottom: 10, lineHeight: 1.1 }}>
                Welcome back.
              </h1>
              <p style={{ fontSize: 14.5, color: "var(--ash)", margin: 0, marginBottom: 30, lineHeight: 1.55, letterSpacing: "-0.005em" }}>
                Enter your email. We&apos;ll send a one-time sign-in link — no password.
              </p>

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@studio.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setState("idle"); setError(""); }}
                  error={error}
                  prefix={<Icon.mail s={14} />}
                  size="lg"
                  autoFocus
                />
                <Button variant="primary" size="lg" type="submit" full loading={state === "sending"} iconRight={state !== "sending" && <Icon.arrow s={14} />}>
                  {state === "sending" ? "Sending link" : "Send sign-in link"}
                </Button>
              </form>

              <div
                style={{
                  marginTop: 28,
                  padding: "12px 14px",
                  background: "rgba(22,24,31,0.5)",
                  border: "1px solid var(--hair)",
                  borderRadius: 10,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ color: "#ff7468", display: "inline-flex", marginTop: 1 }}>
                  <Icon.shield s={14} />
                </span>
                <div style={{ fontSize: 11.5, color: "var(--ash)", lineHeight: 1.5, letterSpacing: "-0.005em" }}>
                  Redline uses Supabase auth. No passwords stored. You can revoke sessions any time from your account.
                </div>
              </div>
            </>
          ) : (
            <div style={{ animation: "rl-fade-up 400ms var(--ease-out)" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(126,192,138,0.12)",
                  color: "#9fd3aa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                  border: "1px solid rgba(126,192,138,0.25)",
                }}
              >
                <Icon.check s={24} />
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.03em", margin: 0, marginBottom: 10, lineHeight: 1.1 }}>
                Check your inbox.
              </h1>
              <p style={{ fontSize: 14.5, color: "var(--ash)", margin: 0, marginBottom: 24, lineHeight: 1.55, letterSpacing: "-0.005em" }}>
                We sent a sign-in link to <span style={{ color: "var(--warm-white)" }}>{email}</span>.
                It expires in 15 minutes.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button variant="primary" size="lg" full onClick={() => onNav("dashboard")} iconRight={<Icon.arrow s={14} />}>
                  Open dashboard after sign-in
                </Button>
                <Button variant="ghost" size="md" onClick={() => { setState("idle"); setEmail(""); }}>
                  Use a different email
                </Button>
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 11.5, color: "var(--ash-dim)", letterSpacing: "-0.005em" }}>
          By continuing you agree to our <a href="/terms" style={{ textDecoration: "underline", textDecorationColor: "var(--hair)" }}>Terms</a> and <a href="/privacy" style={{ textDecoration: "underline", textDecorationColor: "var(--hair)" }}>Privacy</a>.
        </div>
      </div>

      {/* Right — atmospheric panel */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #111217 0%, #08090b 100%)",
          borderLeft: "1px solid var(--hair)",
        }}
      >
        <video
          src="/assets/redline-login-loop.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "110%",
            height: "110%",
            objectFit: "cover",
            opacity: 0.35,
            filter: "saturate(0.9) contrast(1.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 80% at 50% 50%, transparent 0%, rgba(8,9,11,0.7) 70%, #08090b 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 220,
            height: 220,
            background: "radial-gradient(50% 50% at 50% 50%, rgba(255,58,48,0.22) 0%, transparent 70%)",
            filter: "blur(30px)",
            animation: "rl-breathe 4s ease-in-out infinite",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: 48,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ maxWidth: 440 }}>
            <div style={{ marginBottom: 24 }}>
              <Chip tone="red" size="md" icon={<span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff4b3e", boxShadow: "0 0 6px #ff4b3e" }} />}>
                your operator, Rei
              </Chip>
            </div>
            <blockquote
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                color: "var(--warm-white)",
                marginBottom: 22,
              }}
            >
              &quot;You send once. I&apos;ll do the awkward part — making sure it actually gets paid.
              Calm. Friendly first. Firmer when it&apos;s time.&quot;
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <OperatorBadge size={36} status="working" />
              <div>
                <div style={{ fontSize: 13, color: "var(--warm-white-dim)", fontWeight: 500, letterSpacing: "-0.005em" }}>
                  Rei · Redline operator
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ash)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
                  watching · 14 open invoices
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// Dashboard shell — sidebar + main work surface with invoice list, stats, operator feed.

const statusChip = (s, days) => {
  if (s === "paid") return <Chip tone="ok" icon={<Icon.check s={10} />}>Paid</Chip>;
  if (s === "overdue") return <Chip tone="red">Overdue · {days}d</Chip>;
  if (s === "sent") return <Chip tone="amber">Awaiting · due in {-days}d</Chip>;
  return <Chip tone="neutral">Draft</Chip>;
};

/**
 * @param {{ route: string, onNav?: (route: string) => void, children: React.ReactNode }} props
 */
const DashboardShell = ({ route, onNav, children }) => {
  const routeTargets = {
    landing: "/",
    dashboard: "/dashboard",
    invoices: "/dashboard/invoices",
    new: "/dashboard/invoices/new",
    clients: "/dashboard/clients",
    sequences: "/dashboard/sequences",
    cashflow: "/dashboard/cashflow",
    activity: "/dashboard/activity",
    settings: "/dashboard/settings",
  };

  const navigate = (id) => {
    if (onNav) {
      onNav(id);
      return;
    }

    window.location.href = routeTargets[id] || "/dashboard";
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const NavItem = ({ id, icon, label, badge, active }) => (
    <button
      onClick={() => navigate(id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        fontSize: 13,
        color: active ? "var(--warm-white)" : "var(--ash)",
        background: active ? "rgba(255,255,255,0.04)" : "transparent",
        border: active ? "1px solid var(--hair)" : "1px solid transparent",
        width: "100%",
        textAlign: "left",
        transition: "all 160ms var(--ease-out)",
        letterSpacing: "-0.005em",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ color: active ? "#ff7468" : "var(--ash-dim)", display: "inline-flex" }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <Chip tone={active ? "red" : "neutral"} size="sm">{badge}</Chip>}
    </button>
  );

  return (
    <div className="dashboard-shell" style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "var(--graphite-900)" }}>
      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid var(--hair)",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "rgba(12,13,17,0.6)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <button onClick={() => navigate("landing")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 6px" }}>
          <WordMark size={15} />
        </button>

        <Button variant="primary" size="md" full icon={<Icon.plus s={14} />} onClick={() => navigate("new")}>
          New invoice
        </Button>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem id="dashboard" icon={<Icon.home s={14} />} label="Overview" active={route === "dashboard"} />
          <NavItem id="invoices" icon={<Icon.doc s={14} />} label="Invoices" active={route === "invoices"} />
          <NavItem id="clients" icon={<Icon.user s={14} />} label="Clients" active={route === "clients"} />
          <NavItem id="sequences" icon={<Icon.bell s={14} />} label="Sequences" active={route === "sequences"} />
          <NavItem id="cashflow" icon={<Icon.trend s={14} />} label="Cashflow" active={route === "cashflow"} />
          <NavItem id="activity" icon={<Icon.bell s={14} />} label="Activity" active={route === "activity"} />
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem id="settings" icon={<Icon.cog s={14} />} label="Settings" active={route === "settings"} />
          <Button variant="ghost" size="md" full icon={<Icon.arrow s={14} />} onClick={handleLogout} style={{ marginTop: 8 }}>
            Logout
          </Button>
        </div>

        {/* Operator status card */}
        <div
          style={{
            padding: 12,
            background: "linear-gradient(180deg, rgba(22,24,31,0.7), rgba(12,13,17,0.7))",
            border: "1px solid var(--hair)",
            borderRadius: 10,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <OperatorBadge size={32} status="working" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.005em" }}>Rei is standing by</div>
            <div style={{ fontSize: 10.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              live invoice checks
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ minWidth: 0 }}>{children}</main>
    </div>
  );
};

const StatTile = ({ label, value, delta, tone = "neutral", sub }) => {
  const toneColor = { ok: "#9fd3aa", red: "#ff7468", amber: "#f0ce93", neutral: "var(--ash)" };
  return (
    <div
      style={{
        padding: 18,
        border: "1px solid var(--hair)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(22,24,31,0.5), rgba(12,13,17,0.5))",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: "var(--ash)", letterSpacing: "-0.005em" }}>{label}</span>
        {delta && <span style={{ fontSize: 11, color: toneColor[tone], fontFamily: "var(--font-mono)" }}>{delta}</span>}
      </div>
      <div style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 500, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--ash-dim)" }}>{sub}</div>}
    </div>
  );
};

const sameDay = (a, b) => {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
};

const getDueDate = (invoice) => {
  return invoice.due_date ? new Date(`${invoice.due_date}T00:00:00`) : null;
};

const getPaidDate = (invoice) => {
  return invoice.paid_at ? new Date(invoice.paid_at) : null;
};

const formatMoney = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const CashflowChart = ({ invoices = [], today }) => {
  const data = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const paid = invoices
      .filter((invoice) => invoice.status === "paid")
      .filter((invoice) => {
        const paidDate = getPaidDate(invoice);
        return paidDate ? sameDay(paidDate, date) : false;
      })
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

    const due = invoices
      .filter((invoice) => invoice.status !== "paid" && invoice.status !== "void" && invoice.status !== "draft")
      .filter((invoice) => {
        const dueDate = getDueDate(invoice);
        return dueDate ? sameDay(dueDate, date) : false;
      })
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      paid,
      due,
    };
  });
  const max = Math.max(...data.map(d => d.paid + d.due), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180, padding: "12px 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 3 }}>
            <div
              style={{
                height: `${(d.due / max) * 100}%`,
                background: "linear-gradient(180deg, rgba(255,75,62,0.4), rgba(255,75,62,0.15))",
                border: "1px solid rgba(255,75,62,0.3)",
                borderRadius: "4px 4px 0 0",
                animation: `rl-fade-up 500ms var(--ease-out) ${i * 50}ms both`,
              }}
            />
            <div
              style={{
                height: `${(d.paid / max) * 100}%`,
                background: "linear-gradient(180deg, rgba(126,192,138,0.5), rgba(126,192,138,0.2))",
                border: "1px solid rgba(126,192,138,0.3)",
                borderRadius: i === 0 && d.paid === max ? "4px 4px 0 0" : "0",
                animation: `rl-fade-up 500ms var(--ease-out) ${i * 50 + 100}ms both`,
              }}
            />
          </div>
          <span style={{ fontSize: 10.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * @param {{ invoices?: Array<{ id?: string, client_name?: string, client_email?: string, total?: number | string, status?: string, due_date?: string, last_reminder_stage?: number }> }} props
 */
const DashboardHome = ({ invoices = [] }) => {
  const router = useRouter();
  const [filter, setFilter] = React.useState("all");
  const sourceInvoices = invoices;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  React.useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("focus", refresh);
    const refreshTimer = window.setInterval(refresh, 30000);

    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(refreshTimer);
    };
  }, [router]);

  const invoiceRows = sourceInvoices.map((invoice) => {
    const dueDate = invoice.due_date ? new Date(`${invoice.due_date}T00:00:00`) : null;
    const dueTime = dueDate ? dueDate.getTime() : today.getTime();
    const daysUntilDue = Math.ceil((dueTime - today.getTime()) / 86400000);
    const status = invoice.status || "draft";
    const overdueDays = Math.max(Math.abs(Math.min(daysUntilDue, 0)), 0);
    const days = status === "overdue" ? overdueDays : -Math.max(daysUntilDue, 0);
    const due = dueDate
      ? dueDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
      : "No due date";

    let last = "Quiet";
    if (status === "draft") last = "Draft";
    if (status === "paid") last = "Paid";
    if (status === "sent") last = daysUntilDue > 0 ? `Due in ${daysUntilDue}d` : "Awaiting";
    if (status === "overdue") last = overdueDays > 0 ? `${overdueDays}d overdue` : "Overdue";
    if (invoice.last_reminder_stage > 0 && status !== "paid") {
      last = `Stage ${invoice.last_reminder_stage}`;
    }

    return {
      id: invoice.id ? `INV-${String(invoice.id).slice(0, 8)}` : "INV",
      rawId: invoice.id || "",
      client: invoice.client_name || "Unnamed client",
      email: invoice.client_email || "",
      amount: Number(invoice.total || 0),
      dueDate,
      paidAt: invoice.paid_at || null,
      createdAt: invoice.created_at || null,
      due,
      status,
      days,
      last,
    };
  });

  const filtered = invoiceRows.filter(i => filter === "all" || i.status === filter);

  const openInvoices = invoiceRows.filter(i => i.status !== "paid" && i.status !== "draft");
  const overdueInvoices = invoiceRows.filter(i => i.status === "overdue");
  const paidInvoices = invoiceRows.filter(i => i.status === "paid");
  const outstanding = openInvoices.reduce((a, b) => a + b.amount, 0);
  const overdue = overdueInvoices.reduce((a, b) => a + b.amount, 0);
  const paid30 = paidInvoices.reduce((a, b) => a + b.amount, 0);
  const paidWithDates = paidInvoices.filter((invoice) => invoice.paidAt && invoice.createdAt);
  const avgDaysToPay = paidWithDates.length
    ? paidWithDates.reduce((sum, invoice) => {
      const paidAt = new Date(invoice.paidAt).getTime();
      const createdAt = new Date(invoice.createdAt).getTime();
      return sum + Math.max(Math.ceil((paidAt - createdAt) / 86400000), 0);
    }, 0) / paidWithDates.length
    : null;

  const currentMonth = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const nextActions = invoiceRows
    .filter((invoice) => invoice.status === "sent" || invoice.status === "overdue")
    .map((invoice) => {
      if (invoice.days < 0) {
        return {
          key: invoice.rawId || invoice.id,
          when: `due in ${Math.abs(invoice.days)}d`,
          who: invoice.client,
          what: "Watching",
          tone: "amber",
          priority: Math.abs(invoice.days) + 100,
        };
      }

      const currentStage = Number(sourceInvoices.find((item) => item.id === invoice.rawId)?.last_reminder_stage ?? 0);
      const targetStage = invoice.days >= 30 ? 4 : invoice.days >= 21 ? 3 : invoice.days >= 14 ? 2 : invoice.days >= 7 ? 1 : 0;

      if (targetStage > currentStage) {
        const stageLabel = {
          1: "Friendly reminder",
          2: "Direct reminder",
          3: "Late-fee notice",
          4: "Final notice",
        }[targetStage];

        return {
          key: invoice.rawId || invoice.id,
          when: "next cron",
          who: invoice.client,
          what: stageLabel,
          tone: targetStage >= 3 ? "red" : "amber",
          priority: -targetStage,
        };
      }

      return {
        key: invoice.rawId || invoice.id,
        when: invoice.days >= 7 ? `stage ${currentStage} sent` : `day ${invoice.days} overdue`,
        who: invoice.client,
        what: invoice.days >= 7 ? "Waiting" : "No send yet",
        tone: invoice.days >= 7 ? "neutral" : "amber",
        priority: 50 - invoice.days,
      };
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  const reiMessage = (() => {
    const ready = nextActions.find((action) => action.when === "next cron");

    if (ready) {
      return `${ready.what} is ready for ${ready.who}. I will send it on the next reminder run.`;
    }

    if (overdueInvoices.length > 0) {
      return `${overdueInvoices.length} overdue invoice${overdueInvoices.length === 1 ? "" : "s"} are being tracked. No duplicate nudge will send until the next stage is due.`;
    }

    if (openInvoices.length > 0) {
      return `${openInvoices.length} open invoice${openInvoices.length === 1 ? "" : "s"} are being watched. I will start reminders at 7 days overdue.`;
    }

    return "No open invoices right now. Create an invoice and I will watch it from the due date onward.";
  })();

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid var(--hair)",
          position: "sticky",
          top: 0,
          background: "rgba(8,9,11,0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>Overview</h1>
          <Chip tone="dark" size="sm">{currentMonth}</Chip>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--hair)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--ash)",
              minWidth: 260,
            }}
          >
            <Icon.search s={13} />
            <span style={{ flex: 1 }}>Search invoices, clients…</span>
            <Kbd>⌘K</Kbd>
          </div>
          <Button variant="secondary" size="sm" icon={<Icon.bell s={13} />}>
            Activity
          </Button>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, animation: "rl-fade-up 400ms var(--ease-out)" }}>
        {/* Operator greeting */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "14px 18px",
            background: "linear-gradient(90deg, rgba(255,75,62,0.08) 0%, rgba(22,24,31,0.3) 60%)",
            border: "1px solid rgba(255,75,62,0.15)",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <OperatorBadge size={40} status="working" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "var(--warm-white)", letterSpacing: "-0.01em", marginBottom: 2 }}>
              Morning. <span style={{ color: "var(--ash)" }}>{reiMessage}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
              rei · live
            </div>
          </div>
          <Button variant="secondary" size="sm">Review queue</Button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="stat-grid">
          <StatTile label="Outstanding" value={`$${outstanding.toLocaleString()}`} sub={`across ${openInvoices.length} invoices`} delta={openInvoices.length ? "open" : "clear"} tone="amber" />
          <StatTile label="Overdue" value={`$${overdue.toLocaleString()}`} sub={`${overdueInvoices.length} clients`} delta={overdueInvoices.length ? "needs action" : "clear"} tone="red" />
          <StatTile label="Paid · 30d" value={formatMoney(paid30)} sub={`${paidInvoices.length} invoices`} delta={paidInvoices.length ? "paid" : "none"} tone="ok" />
          <StatTile label="Avg. days to pay" value={avgDaysToPay === null ? "—" : avgDaysToPay.toFixed(1)} sub={avgDaysToPay === null ? "no paid invoices yet" : `${paidWithDates.length} paid invoices`} delta={avgDaysToPay === null ? "" : "live"} tone="ok" />
        </div>

        {/* Two-col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }} className="dash-grid">
          {/* Invoices */}
          <Panel padded={false}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>Invoices</div>
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", padding: 3, borderRadius: 8, border: "1px solid var(--hair)" }}>
                {["all", "overdue", "sent", "paid", "draft"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "5px 10px",
                      fontSize: 11.5,
                      borderRadius: 5,
                      color: filter === f ? "var(--warm-white)" : "var(--ash)",
                      background: filter === f ? "rgba(255,255,255,0.06)" : "transparent",
                      textTransform: "capitalize",
                      letterSpacing: "-0.005em",
                      transition: "all 160ms var(--ease-out)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1.4fr 1fr 1fr auto", gap: 14, padding: "10px 18px", fontSize: 10.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0.5, borderBottom: "1px solid var(--hair-soft)" }}>
              <span style={{ width: 70 }}>ID</span>
              <span>CLIENT</span>
              <span>AMOUNT</span>
              <span>STATUS</span>
              <span style={{ width: 140 }}>NEXT</span>
            </div>

            <div>
              {filtered.map((inv, i) => (
                <div
                  key={inv.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1.4fr 1fr 1fr auto",
                    gap: 14,
                    padding: "12px 18px",
                    borderBottom: i === filtered.length - 1 ? "none" : "1px solid var(--hair-soft)",
                    fontSize: 13,
                    alignItems: "center",
                    transition: "background 140ms var(--ease-out)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)", letterSpacing: 0, width: 70 }}>
                    {inv.id}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.client}</div>
                    <div style={{ fontSize: 11, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.email}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, letterSpacing: "-0.01em" }}>
                    ${inv.amount.toLocaleString()}
                  </div>
                  <div>{statusChip(inv.status, inv.days)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ash)", width: 140, textAlign: "right", letterSpacing: "-0.005em" }}>
                    {inv.last}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: "28px 18px", color: "var(--ash)", fontSize: 13 }}>
                  No invoices found.
                </div>
              )}
            </div>
          </Panel>

          {/* Right side */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>Cashflow · 7d</span>
                <Chip tone="ok" size="sm">{formatMoney(paid30)}</Chip>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ash)", marginBottom: 6 }}>Paid vs due, last 7 days. Refreshes while this page is open.</div>
              <CashflowChart invoices={sourceInvoices} today={today} />
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--ash)", paddingTop: 4 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(126,192,138,0.5)", border: "1px solid rgba(126,192,138,0.4)" }} />
                  Paid
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,75,62,0.3)", border: "1px solid rgba(255,75,62,0.3)" }} />
                  Due
                </span>
              </div>
            </Panel>

            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em" }}>What&apos;s sending next</span>
                <OperatorBadge size={18} status="working" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {nextActions.map((q) => (
                  <div key={q.key} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(8,9,11,0.5)", border: "1px solid var(--hair-soft)", borderRadius: 8 }}>
                    <div style={{ width: 4, borderRadius: 2, background: q.tone === "red" ? "#ff4b3e" : q.tone === "amber" ? "#e8c07c" : "var(--ash)", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, letterSpacing: "-0.005em" }}>{q.what} · <span style={{ color: "var(--ash)" }}>{q.who}</span></div>
                      <div style={{ fontSize: 11, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0, marginTop: 1 }}>{q.when}</div>
                    </div>
                  </div>
                ))}
                {nextActions.length === 0 && (
                  <div style={{ padding: "10px 12px", background: "rgba(8,9,11,0.5)", border: "1px solid var(--hair-soft)", borderRadius: 8, color: "var(--ash)", fontSize: 12.5 }}>
                    No active sends queued.
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @param {{ id: string, status?: string }} props
 */
const InvoiceActions = ({ id, status = "draft" }) => {
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [copying, setCopying] = React.useState(false);

  const sendNow = async () => {
    setMessage("");
    setSending(true);
    const response = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
    setSending(false);
    setMessage(response.ok ? "Sent." : "Send failed.");
  };

  const copyPayLink = async () => {
    setMessage("");
    setCopying(true);
    const response = await fetch(`/api/invoices/${id}/pay-link`, { method: "POST" });
    const body = await response.json();
    setCopying(false);

    if (!response.ok || !body.url) {
      setMessage("Pay link failed.");
      return;
    }

    await navigator.clipboard.writeText(body.url);
    setMessage("Pay link copied.");
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Button variant="secondary" size="sm" icon={<Icon.send s={12} />} onClick={sendNow} loading={sending} disabled={status === "paid"}>
        Send now
      </Button>
      <Button variant="ghost" size="sm" icon={<Icon.copy s={12} />} onClick={copyPayLink} loading={copying}>
        Copy pay link
      </Button>
      {message && (
        <span style={{ fontSize: 11.5, color: "var(--ash)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
          {message}
        </span>
      )}
    </div>
  );
};



// Invoice creation page — smooth, confident form with live preview.

const NewInvoicePage = ({ onNav }) => {
  const [client, setClient] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [due, setDue] = React.useState("2026-05-08");
  const [lines, setLines] = React.useState([
    { id: 1, desc: "Brand system — Phase 2", qty: 1, unit: 1800 },
    { id: 2, desc: "", qty: 1, unit: 0 },
  ]);
  const [tone, setTone] = React.useState("friendly");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sequence, setSequence] = React.useState("default");
  const [lateFee, setLateFee] = React.useState(true);
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const updateLine = (id, field, value) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  const addLine = () => {
    setLines([...lines, { id: Date.now(), desc: "", qty: 1, unit: 0 }]);
  };
  const removeLine = (id) => {
    if (lines.length <= 1) return;
    setLines(lines.filter(l => l.id !== id));
  };

  const subtotal = lines.reduce((a, l) => a + l.qty * l.unit, 0);
  const tax = subtotal * 0;
  const total = subtotal + tax;

  const canSend = client && email.match(/^[^\s@]+@[^\s@]+/) && lines.some(l => l.desc && l.unit > 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: client,
        client_email: email,
        due_date: due,
        rows: lines
          .filter((line) => line.desc && line.unit > 0)
          .map((line) => ({
            description: line.desc,
            quantity: Number(line.qty),
            unit_price: Number(line.unit),
          })),
      }),
    });

    setSending(false);

    if (!response.ok) return;

    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ padding: 40, maxWidth: 560, margin: "80px auto", textAlign: "center", animation: "rl-fade-up 500ms var(--ease-out)" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(126,192,138,0.12)",
            border: "1px solid rgba(126,192,138,0.3)",
            color: "#9fd3aa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Icon.check s={28} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.03em", margin: 0, marginBottom: 10 }}>
          Invoice sent.
        </h1>
        <p style={{ fontSize: 14.5, color: "var(--ash)", lineHeight: 1.55, margin: 0, marginBottom: 24 }}>
          <span style={{ color: "var(--warm-white-dim)" }}>{client}</span> has the payment link.
          Rei will send the first reminder 7 days after the due date if it&apos;s still open.
        </p>
        <div style={{ display: "inline-flex", gap: 10 }}>
          <Button variant="primary" size="md" onClick={() => onNav("dashboard")} iconRight={<Icon.arrow s={13} />}>
            Back to dashboard
          </Button>
          <Button variant="secondary" size="md" onClick={() => {
            setSent(false); setClient(""); setEmail(""); setLines([{ id: 1, desc: "", qty: 1, unit: 0 }]);
          }}>
            Send another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid var(--hair)",
          position: "sticky",
          top: 0,
          background: "rgba(8,9,11,0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button variant="ghost" size="sm" onClick={() => onNav("dashboard")} icon={<Icon.chev s={13} dir="left" />}>
            Back
          </Button>
          <span style={{ color: "var(--ash-deep)" }}>/</span>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>New invoice</h1>
          <Chip tone="dark" size="sm">Draft · autosaved</Chip>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" size="sm">Save draft</Button>
          <Button variant="primary" size="sm" icon={<Icon.send s={12} />} onClick={submit} loading={sending} disabled={!canSend}>
            Send invoice
          </Button>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, animation: "rl-fade-up 400ms var(--ease-out)" }} className="new-grid">
        {/* Form */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel>
            <div style={{ fontSize: 11, color: "#ff7468", fontFamily: "var(--font-mono)", letterSpacing: 1, marginBottom: 14 }}>CLIENT</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="cli-grid">
              <Input
                label="Client name"
                placeholder="Harbor Studio"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                name="client_name"
                required
              />
              <Input
                label="Client email"
                type="email"
                placeholder="ops@harborstudio.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="client_email"
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }} className="cli-grid">
              <Input
                label="Due date"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                name="due_date"
                required
              />
              <Input
                label="Invoice #"
                value="INV-0252"
                disabled
                suffix={<Chip tone="dark" size="sm">auto</Chip>}
              />
            </div>
          </Panel>

          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: "#ff7468", fontFamily: "var(--font-mono)", letterSpacing: 1 }}>LINE ITEMS</span>
              <span style={{ fontSize: 11, color: "var(--ash-dim)" }}>{lines.length} row{lines.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 110px 32px", gap: 10, fontSize: 10.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0.5, marginBottom: 8, padding: "0 4px" }} className="line-head">
              <span>DESCRIPTION</span>
              <span>QTY</span>
              <span>UNIT</span>
              <span style={{ textAlign: "right" }}>TOTAL</span>
              <span></span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lines.map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 120px 110px 32px",
                    gap: 10,
                    alignItems: "center",
                    padding: "8px",
                    border: "1px solid var(--hair-soft)",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.015)",
                  }}
                  className="line-row"
                >
                  <input
                    value={l.desc}
                    onChange={(e) => updateLine(l.id, "desc", e.target.value)}
                    placeholder="Description"
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: 13,
                      color: "var(--warm-white)",
                      padding: "8px 10px",
                      letterSpacing: "-0.005em",
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    value={l.qty}
                    onChange={(e) => updateLine(l.id, "qty", Math.max(1, +e.target.value || 0))}
                    style={{
                      background: "rgba(8,9,11,0.5)",
                      border: "1px solid var(--hair-soft)",
                      outline: "none",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontFamily: "var(--font-mono)",
                      color: "var(--warm-white)",
                      padding: "6px 8px",
                      textAlign: "right",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "rgba(8,9,11,0.5)",
                      border: "1px solid var(--hair-soft)",
                      borderRadius: 6,
                      paddingLeft: 8,
                    }}
                  >
                    <span style={{ color: "var(--ash)", fontSize: 12 }}>$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.unit}
                      onChange={(e) => updateLine(l.id, "unit", +e.target.value || 0)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        fontSize: 12.5,
                        fontFamily: "var(--font-mono)",
                        color: "var(--warm-white)",
                        padding: "6px 8px",
                        textAlign: "right",
                        minWidth: 0,
                      }}
                    />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, textAlign: "right", color: l.qty * l.unit > 0 ? "var(--warm-white)" : "var(--ash-dim)", letterSpacing: "-0.01em" }}>
                    ${(l.qty * l.unit).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(l.id)}
                    disabled={lines.length === 1}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      color: "var(--ash-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: lines.length === 1 ? 0.3 : 1,
                      transition: "all 140ms var(--ease-out)",
                    }}
                    onMouseEnter={(e) => { if (lines.length > 1) { e.currentTarget.style.background = "rgba(255,75,62,0.12)"; e.currentTarget.style.color = "#ff7468"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ash-dim)"; }}
                  >
                    <Icon.x s={13} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLine}
              style={{
                marginTop: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                color: "var(--ash)",
                fontSize: 12.5,
                border: "1px dashed var(--hair-strong)",
                borderRadius: 8,
                letterSpacing: "-0.005em",
              }}
            >
              <Icon.plus s={12} /> Add line
            </button>

            {/* Totals */}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--hair)", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              <div style={{ display: "flex", gap: 40, color: "var(--ash)" }}>
                <span>Subtotal</span>
                <span style={{ color: "var(--warm-white-dim)", minWidth: 90, textAlign: "right" }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", gap: 40, color: "var(--ash)" }}>
                <span>Tax</span>
                <span style={{ color: "var(--warm-white-dim)", minWidth: 90, textAlign: "right" }}>$0.00</span>
              </div>
              <div style={{ display: "flex", gap: 40, fontSize: 17, letterSpacing: "-0.02em", fontWeight: 500, marginTop: 6 }}>
                <span>Total</span>
                <span style={{ minWidth: 90, textAlign: "right" }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </Panel>

          <Panel>
            <div style={{ fontSize: 11, color: "#ff7468", fontFamily: "var(--font-mono)", letterSpacing: 1, marginBottom: 14 }}>FOLLOW-UP</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--ash)", letterSpacing: 0.2, textTransform: "uppercase", marginBottom: 8 }}>Tone</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["friendly", "neutral", "firm"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        background: tone === t ? "rgba(255,75,62,0.1)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${tone === t ? "rgba(255,75,62,0.3)" : "var(--hair)"}`,
                        borderRadius: 9,
                        fontSize: 12.5,
                        color: tone === t ? "#ff7468" : "var(--ash)",
                        textTransform: "capitalize",
                        letterSpacing: "-0.005em",
                        transition: "all 160ms var(--ease-out)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--ash)", letterSpacing: 0.2, textTransform: "uppercase", marginBottom: 8 }}>Sequence</div>
                <div
                  style={{
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--hair)",
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <OperatorBadge size={22} status="working" />
                    <div>
                      <div style={{ fontSize: 13, letterSpacing: "-0.005em" }}>Default · 7 / 14 / 21 / 30 days overdue</div>
                      <div style={{ fontSize: 11, color: "var(--ash-dim)" }}>Friendly → direct → late-fee notice → final notice</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--hair)",
                  borderRadius: 9,
                  cursor: "pointer",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLateFee(!lateFee)}
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 10,
                    background: lateFee ? "#ff4b3e" : "rgba(255,255,255,0.08)",
                    position: "relative",
                    transition: "background 200ms var(--ease-out)",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: lateFee ? 16 : 2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 200ms var(--ease-out)",
                    }}
                  />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, letterSpacing: "-0.005em" }}>Apply late fee</div>
                  <div style={{ fontSize: 11, color: "var(--ash-dim)" }}>Uses your Settings rule before the stage 3 notice.</div>
                </div>
              </label>
            </div>
          </Panel>
        </form>

        {/* Preview */}
        <div style={{ position: "sticky", top: 80, alignSelf: "start" }}>
          <div style={{ fontSize: 10.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 1, marginBottom: 10, paddingLeft: 2 }}>
            LIVE PREVIEW
          </div>
          <Panel padded={false}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hair)", display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--ash)", fontFamily: "var(--font-mono)" }}>
              <Icon.mail s={12} />
              to: {email || "client@—"}
            </div>
            <div style={{ padding: 20, background: "#f5f1ea", color: "#1a1a1d", borderRadius: "0 0 14px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b6e", fontFamily: "var(--font-mono)", letterSpacing: 0.5, marginBottom: 4 }}>INVOICE</div>
                  <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>INV-0252</div>
                </div>
                <BrandMark size={28} />
              </div>
              <div style={{ fontSize: 13, marginBottom: 16, letterSpacing: "-0.005em" }}>
                Hey {client || "—"}, here&apos;s the invoice for this month. Link below pays in one tap.
              </div>
              <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                {lines.filter(l => l.desc).map((l, i) => (
                  <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "8px 10px", fontSize: 12, borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.06)" }}>
                    <span>{l.desc}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>${(l.qty * l.unit).toFixed(2)}</span>
                  </div>
                ))}
                {lines.filter(l => l.desc).length === 0 && (
                  <div style={{ padding: "12px 10px", fontSize: 12, color: "#6b6b6e", fontStyle: "italic" }}>No line items yet.</div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>Total</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>${total.toFixed(2)}</span>
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  background: "#9b1c1f",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 12.5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 500,
                }}
              >
                <Icon.link s={12} /> Pay ${total.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: "#6b6b6e", marginTop: 14 }}>
                Due {due}. Replies go to you directly.
              </div>
            </div>
          </Panel>

          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              background: "rgba(22,24,31,0.5)",
              border: "1px solid var(--hair)",
              borderRadius: 10,
            }}
          >
            <OperatorBadge size={24} status="working" />
            <div style={{ fontSize: 12, color: "var(--ash)", lineHeight: 1.5, letterSpacing: "-0.005em" }}>
              If this stays open past <span style={{ color: "var(--warm-white-dim)" }}>{due}</span>, I&apos;ll send a
              {" "}<span style={{ color: "#ff7468" }}>{tone}</span>{" "}reminder at 7 days overdue, escalate at 14 days,
              and use your late-fee rule before the 21-day notice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export { LandingPage, LoginPage, DashboardShell, DashboardHome, NewInvoicePage, InvoiceActions };
