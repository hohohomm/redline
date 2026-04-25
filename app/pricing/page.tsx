import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple monthly pricing. Starter $29, Pro $79. First 50 customers get first month free.",
};

const plans = [
  {
    name: "Starter",
    price: 29,
    blurb: "For solo freelancers and sole traders.",
    features: [
      "Up to 25 invoices per month",
      "Automated email follow-ups",
      "Stripe pay links on every invoice",
      "Friendly / Neutral / Firm tone control",
      "Late fee automation",
      "Single user",
    ],
    cta: "Start with Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: 79,
    blurb: "For growing service businesses.",
    features: [
      "Unlimited invoices",
      "SMS + WhatsApp follow-ups (coming)",
      "Xero + QuickBooks sync (coming)",
      "Multiple team members",
      "Priority support",
      "Everything in Starter",
    ],
    cta: "Start with Pro",
    highlight: true,
  },
];

const faqs = [
  {
    q: "Can I switch plans?",
    a: "Yes. Up or down, any time, prorated automatically.",
  },
  {
    q: "What happens at 25 invoices on Starter?",
    a: "You'll get a friendly heads-up at 20. We never block sends mid-cycle. We'll suggest Pro if it makes sense.",
  },
  {
    q: "Do you take a cut of my payments?",
    a: "No. Stripe takes their standard fee directly. Redline takes nothing on top.",
  },
  {
    q: "Free trial?",
    a: "First 50 customers get the first month free. No card required to start.",
  },
];

export default function PricingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--graphite-900)",
        color: "var(--warm-white)",
        fontFamily: "var(--font-sans)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 40% at 70% 0%, rgba(255,75,62,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          position: "relative",
          padding: "28px 28px 0",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ color: "var(--warm-white)", textDecoration: "none", fontWeight: 600, letterSpacing: "-0.02em", fontSize: 18 }}>
          Redline
        </Link>
        <Link
          href="/login"
          style={{
            color: "var(--warm-white-dim)",
            textDecoration: "none",
            fontSize: 14,
            padding: "8px 14px",
            border: "1px solid var(--hair)",
            borderRadius: "var(--r-md)",
          }}
        >
          Sign in
        </Link>
      </header>

      <section
        style={{
          position: "relative",
          padding: "80px 28px 24px",
          maxWidth: 1080,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            background: "var(--red-wash)",
            border: "1px solid rgba(255,75,62,0.25)",
            borderRadius: 999,
            fontSize: 12,
            color: "var(--red-hot)",
            marginBottom: 24,
          }}
        >
          Beta · invite only · first 50 customers get first month free
        </div>

        <h1
          style={{
            fontSize: "clamp(48px, 7vw, 88px)",
            fontWeight: 500,
            letterSpacing: "-0.035em",
            lineHeight: 1.04,
            margin: 0,
            marginBottom: 18,
          }}
        >
          Simple pricing.
          <br />
          <span style={{ color: "var(--ash)" }}>No surprises.</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--ash)",
            lineHeight: 1.55,
            maxWidth: 580,
            margin: "0 auto",
            letterSpacing: "-0.005em",
          }}
        >
          Pay monthly. Cancel any time. Stripe fees pass through directly — Redline takes nothing on top of your payments.
        </p>
      </section>

      <section
        style={{
          position: "relative",
          padding: "48px 28px 80px",
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              position: "relative",
              padding: "32px 28px",
              background: plan.highlight ? "var(--graphite-700)" : "var(--graphite-800)",
              border: plan.highlight ? "1px solid rgba(255,75,62,0.35)" : "1px solid var(--hair)",
              borderRadius: "var(--r-xl)",
              boxShadow: plan.highlight ? "var(--shadow-red)" : "var(--shadow-md)",
            }}
          >
            {plan.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: 24,
                  padding: "4px 10px",
                  background: "var(--red)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 999,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                Most picked
              </div>
            )}

            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                margin: 0,
                marginBottom: 6,
              }}
            >
              {plan.name}
            </h2>
            <p style={{ color: "var(--ash)", fontSize: 14, margin: 0, marginBottom: 22 }}>
              {plan.blurb}
            </p>

            <div style={{ marginBottom: 24, display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                ${plan.price}
              </span>
              <span style={{ color: "var(--ash-dim)", fontSize: 14 }}>/month</span>
            </div>

            <Link
              href="/login"
              style={{
                display: "block",
                textAlign: "center",
                padding: "12px 18px",
                background: plan.highlight ? "var(--red)" : "transparent",
                color: plan.highlight ? "#fff" : "var(--warm-white)",
                border: plan.highlight ? "none" : "1px solid var(--hair-strong)",
                borderRadius: "var(--r-md)",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 24,
              }}
            >
              {plan.cta}
            </Link>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {plan.features.map((f) => (
                <li
                  key={f}
                  style={{
                    fontSize: 14,
                    color: "var(--warm-white-dim)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 16,
                      height: 16,
                      marginTop: 2,
                      borderRadius: "50%",
                      background: "rgba(255,75,62,0.12)",
                      color: "var(--red-hot)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section
        style={{
          position: "relative",
          padding: "0 28px 100px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            margin: 0,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Common questions
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq) => (
            <details
              key={faq.q}
              style={{
                padding: "18px 22px",
                background: "var(--graphite-800)",
                border: "1px solid var(--hair)",
                borderRadius: "var(--r-lg)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--warm-white)",
                  letterSpacing: "-0.005em",
                  listStyle: "none",
                }}
              >
                {faq.q}
              </summary>
              <p
                style={{
                  margin: "12px 0 0",
                  color: "var(--ash)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <footer
        style={{
          position: "relative",
          padding: "32px 28px 48px",
          maxWidth: 1080,
          margin: "0 auto",
          borderTop: "1px solid var(--hair)",
          color: "var(--ash-dim)",
          fontSize: 13,
          display: "flex",
          gap: 18,
          justifyContent: "center",
        }}
      >
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
        <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms</Link>
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
        <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</Link>
      </footer>
    </main>
  );
}
