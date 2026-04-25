export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--graphite-900)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient red radial background */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,75,62,0.09) 0%, transparent 70%)",
          animation: "ob-pulse 8s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {children}
      </div>
      <style>{`
        @keyframes ob-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
