import Link from "next/link";

export default function PaidPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#08090b",
        color: "#f5f1ea",
        fontFamily: "var(--font-sans)",
      }}
    >
      <section style={{ maxWidth: 520, textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 500, letterSpacing: "-0.03em" }}>
          Payment received.
        </h1>
        <p style={{ margin: "14px 0 24px", color: "var(--ash)", lineHeight: 1.6 }}>
          Thanks. The invoice owner will see this invoice marked paid shortly.
        </p>
        <Link href="/" style={{ color: "#ff7468" }}>
          Back to Redline
        </Link>
      </section>
    </main>
  );
}
