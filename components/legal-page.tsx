import Link from "next/link";
import * as React from "react";

// Each block of legal text is either a paragraph or a bulleted list.
type Block = { kind: "p"; text: string } | { kind: "ul"; items: string[] };

// One numbered section, e.g. "1. ABOUT REDLINE".
type Section = { number: number; title: string; body: Block[] };

type ParsedDoc = {
  docTitle: string;
  lastUpdated: string;
  preamble: Block[];
  sections: Section[];
};

// Turn a single text block into a paragraph or a bullet list.
function parseBlock(raw: string): Block {
  const lines = raw.split("\n");
  const allBullets = lines.length > 0 && lines.every((line) => line.startsWith("- "));

  if (allBullets) {
    return { kind: "ul", items: lines.map((line) => line.slice(2)) };
  }

  return { kind: "p", text: raw };
}

// Parse the raw legal text into title, last-updated, preamble, and numbered sections.
function parseDoc(raw: string): ParsedDoc {
  const blocks = raw
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const docTitle = blocks[0] ?? "";
  const lastUpdated = blocks[1] ?? "";

  const preamble: Block[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const block of blocks.slice(2)) {
    // A heading is a single line that starts with a number, a dot, and a space.
    const isSingleLine = !block.includes("\n");
    const headingMatch = isSingleLine ? block.match(/^(\d+)\.\s+(.+)$/) : null;

    if (headingMatch) {
      if (current) {
        sections.push(current);
      }
      current = {
        number: Number.parseInt(headingMatch[1], 10),
        title: headingMatch[2],
        body: [],
      };
      continue;
    }

    const parsed = parseBlock(block);
    if (current) {
      current.body.push(parsed);
    } else {
      preamble.push(parsed);
    }
  }

  if (current) {
    sections.push(current);
  }

  return { docTitle, lastUpdated, preamble, sections };
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "p") {
    return (
      <p
        style={{
          margin: "0 0 14px 0",
          lineHeight: 1.7,
          color: "var(--warm-white-dim)",
          fontSize: 14.5,
        }}
      >
        {block.text}
      </p>
    );
  }

  return (
    <ul
      style={{
        margin: "0 0 14px 0",
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {block.items.map((item) => (
        <li
          key={item}
          style={{
            display: "grid",
            gridTemplateColumns: "16px 1fr",
            gap: 10,
            alignItems: "start",
            lineHeight: 1.6,
            color: "var(--warm-white-dim)",
            fontSize: 14.5,
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--red)", marginTop: 2 }}>
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalPage({ raw }: { raw: string }) {
  const { docTitle, lastUpdated, preamble, sections } = parseDoc(raw);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px 80px",
        background: "var(--graphite-900)",
        color: "var(--warm-white)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
            color: "var(--ash)",
            fontSize: 13,
            transition: "color 200ms var(--ease-out)",
          }}
        >
          <span aria-hidden="true">&larr;</span>
          Back home
        </Link>

        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {docTitle}
          </h1>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 14,
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid var(--hair)",
              background: "var(--red-wash)",
              color: "var(--ash)",
              fontSize: 12,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--red)" }} />
            {lastUpdated}
          </div>
        </header>

        <section
          style={{
            border: "1px solid var(--hair)",
            borderRadius: 14,
            background: "linear-gradient(180deg, rgba(22,24,31,0.72), rgba(12,13,17,0.72))",
            padding: "32px 36px",
            boxShadow: "var(--shadow-panel)",
          }}
        >
          {preamble.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              {preamble.map((block, index) => (
                <BlockView key={index} block={block} />
              ))}
            </div>
          )}

          {sections.map((section, index) => (
            <section
              key={section.number}
              style={{
                paddingTop: index === 0 ? 0 : 24,
                marginTop: index === 0 ? 0 : 24,
                borderTop: index === 0 ? "none" : "1px solid var(--hair-soft)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: "var(--warm-white)",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--red)",
                    letterSpacing: 0,
                  }}
                >
                  {String(section.number).padStart(2, "0")}
                </span>
                <span>{section.title}</span>
              </h2>
              {section.body.map((block, blockIndex) => (
                <BlockView key={blockIndex} block={block} />
              ))}
            </section>
          ))}
        </section>

        <p
          style={{
            marginTop: 28,
            marginBottom: 0,
            fontSize: 12,
            lineHeight: 1.6,
            color: "var(--ash-dim)",
            fontStyle: "italic",
          }}
        >
          RedLine is operated by Phillip Preketes, ABN 29807420241. Contact: support@redlineinvoices.com
        </p>

        <footer
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            color: "var(--ash-dim)",
            fontSize: 12,
          }}
        >
          <Link href="/" style={{ color: "var(--ash)" }}>
            redlineinvoices.com
          </Link>
          <div style={{ display: "flex", gap: 18 }}>
            <Link href="/terms" style={{ color: "var(--ash)" }}>
              Terms
            </Link>
            <Link href="/privacy" style={{ color: "var(--ash)" }}>
              Privacy
            </Link>
            <Link href="/contact" style={{ color: "var(--ash)" }}>
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
