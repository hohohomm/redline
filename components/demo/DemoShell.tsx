"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoToast, useDemoToast } from "./DemoToast";

// ─── Icons (inline, same style as redline-prototype.jsx) ─────────────────────

const Icon = {
  home: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  doc: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  user: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  bell: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 3h16l-2-3ZM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  trend: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="m3 17 6-6 4 4 8-8M14 7h7v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cog: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.32.23.67.26 1.03" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  arrow: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

// ─── BrandMark ────────────────────────────────────────────────────────────────

const BrandMark = ({ size = 32 }: { size?: number }) => {
  const r = Math.max(4, size * 0.22);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "var(--graphite-900) url('/assets/redline-icon.png') center / cover no-repeat",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
        overflow: "hidden",
        flexShrink: 0,
        display: "inline-block",
      }}
      aria-hidden="true"
    />
  );
};

const WordMark = ({ size = 18 }: { size?: number }) => (
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

// ─── NavItem ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
}

const NavItem = ({ href, icon, label, active, badge }: NavItemProps) => (
  <Link
    href={href}
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
      textDecoration: "none",
      letterSpacing: "-0.005em",
      transition: "all 160ms var(--ease-out)",
    }}
  >
    <span style={{ color: active ? "#ff7468" : "var(--ash-dim)", display: "inline-flex" }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 20,
          padding: "0 7px",
          background: active ? "rgba(255,75,62,0.1)" : "rgba(255,255,255,0.04)",
          color: active ? "#ff7468" : "var(--ash)",
          border: `1px solid ${active ? "rgba(255,75,62,0.25)" : "var(--hair)"}`,
          borderRadius: 999,
          fontSize: 10.5,
          fontWeight: 500,
        }}
      >
        {badge}
      </span>
    )}
  </Link>
);

// ─── DemoShell ────────────────────────────────────────────────────────────────

interface DemoShellProps {
  children: React.ReactNode;
}

export function DemoShell({ children }: DemoShellProps) {
  const pathname = usePathname();
  const { visible, fire, hide } = useDemoToast();

  const route = (() => {
    if (pathname === "/demo") return "dashboard";
    if (pathname.startsWith("/demo/invoices")) return "invoices";
    if (pathname.startsWith("/demo/clients")) return "clients";
    if (pathname.startsWith("/demo/activity")) return "activity";
    if (pathname.startsWith("/demo/cashflow")) return "cashflow";
    if (pathname.startsWith("/demo/settings")) return "settings";
    return "dashboard";
  })();

  return (
    <div style={{ minHeight: "100vh", background: "var(--graphite-900)", display: "flex", flexDirection: "column" }}>
      {/* Demo banner */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "linear-gradient(90deg, rgba(155,28,31,0.85) 0%, rgba(255,75,62,0.85) 100%)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,75,62,0.3)",
          padding: "9px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontSize: 13,
          color: "#fff",
          letterSpacing: "-0.01em",
          fontWeight: 450,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            flexShrink: 0,
            animation: "rl-pulse 1.8s ease-in-out infinite",
          }}
        />
        <span>You&apos;re exploring a demo.</span>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 6,
            color: "#fff",
            fontWeight: 500,
            fontSize: 12.5,
            textDecoration: "none",
            transition: "background 160ms",
          }}
        >
          Start free trial <Icon.arrow s={12} />
        </Link>
      </div>

      {/* Dashboard shell */}
      <div
        className="dashboard-shell"
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          flex: 1,
          minHeight: 0,
        }}
      >
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
            top: 37, // banner height
            height: "calc(100vh - 37px)",
            overflow: "auto",
          }}
        >
          <Link href="/demo" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 6px", textDecoration: "none" }}>
            <WordMark size={15} />
          </Link>

          <button
            onClick={fire}
            style={{
              height: 38,
              padding: "0 16px",
              fontSize: 13.5,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              background: "linear-gradient(180deg, #ff4b3e 0%, #d8352a 100%)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 9,
              cursor: "pointer",
              transition: "opacity 180ms",
            }}
          >
            <Icon.plus s={14} />
            New invoice
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <NavItem href="/demo" icon={<Icon.home s={14} />} label="Overview" active={route === "dashboard"} />
            <NavItem href="/demo/invoices" icon={<Icon.doc s={14} />} label="Invoices" active={route === "invoices"} badge="5" />
            <NavItem href="/demo/clients" icon={<Icon.user s={14} />} label="Clients" active={route === "clients"} />
            <NavItem href="/demo/activity" icon={<Icon.bell s={14} />} label="Activity" active={route === "activity"} />
            <NavItem href="/demo/cashflow" icon={<Icon.trend s={14} />} label="Cashflow" active={route === "cashflow"} />
          </div>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            <NavItem href="/demo/settings" icon={<Icon.cog s={14} />} label="Settings" active={route === "settings"} />
            <Link
              href="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--ash)",
                border: "1px solid transparent",
                textDecoration: "none",
                marginTop: 8,
                letterSpacing: "-0.005em",
              }}
            >
              <span style={{ color: "var(--ash-dim)", display: "inline-flex" }}><Icon.arrow s={14} /></span>
              <span>Sign up free</span>
            </Link>
          </div>

          {/* Operator status */}
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
            <div
              aria-label="Rei"
              role="img"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#0c0d11",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 0 1.5px #ff4b3e, 0 0 14px rgba(255,75,62,0.45)",
                fontFamily: "var(--font-mono, ui-monospace, monospace)",
                fontSize: 13,
                fontWeight: 600,
                color: "#ff6a5a",
                letterSpacing: "-0.04em",
                textShadow: "0 0 8px rgba(255,75,62,0.6)",
              }}
            >
              R
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.005em" }}>Rei is standing by</div>
              <div style={{ fontSize: 10.5, color: "var(--ash-dim)", fontFamily: "var(--font-mono)", letterSpacing: 0 }}>
                demo mode
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>

      <DemoToast visible={visible} onHide={hide} />
    </div>
  );
}

// Export fire function via context for child pages
export const DemoActionContext = React.createContext<() => void>(() => {});

export function useDemoAction() {
  return React.useContext(DemoActionContext);
}
