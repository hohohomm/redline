"use client";

import React from "react";

interface DemoToastProps {
  visible: boolean;
  onHide: () => void;
}

export function DemoToast({ visible, onHide }: DemoToastProps) {
  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: "rgba(8,9,11,0.96)",
        border: "1px solid var(--hair-strong)",
        borderRadius: 10,
        fontSize: 13,
        color: "var(--warm-white-dim)",
        letterSpacing: "-0.005em",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        animation: "rl-fade-up 260ms var(--ease-out)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#ff4b3e",
          boxShadow: "0 0 8px #ff4b3e",
          flexShrink: 0,
        }}
      />
      Demo mode — sign up to use your own data
    </div>
  );
}

// Hook to fire demo toast
export function useDemoToast() {
  const [visible, setVisible] = React.useState(false);

  const fire = React.useCallback(() => {
    setVisible(true);
  }, []);

  const hide = React.useCallback(() => {
    setVisible(false);
  }, []);

  return { visible, fire, hide };
}
