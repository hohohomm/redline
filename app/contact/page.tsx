import Link from "next/link";

import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--graphite-900)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 620 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 18,
            color: "var(--ash)",
            fontSize: 13,
          }}
        >
          <span aria-hidden="true">&larr;</span>
          Back home
        </Link>

        <section
          style={{
            border: "1px solid var(--hair)",
            borderRadius: 12,
            background: "linear-gradient(180deg, rgba(22,24,31,0.72), rgba(12,13,17,0.72))",
            padding: 28,
            boxShadow: "var(--shadow-panel)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 500, letterSpacing: "-0.03em" }}>
              Contact Redline
            </h1>
            <p style={{ color: "var(--ash)", margin: "10px auto 0", lineHeight: 1.55, maxWidth: 460 }}>
              Bugs, billing questions, product requests, or setup help. Messages go to support@redlineinvoices.com.
            </p>
          </div>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
