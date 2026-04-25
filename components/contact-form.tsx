"use client";

import { useState } from "react";

type FormStatus = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, body }),
    });

    if (response.ok) {
      setStatus("sent");
      setName("");
      setEmail("");
      setSubject("");
      setBody("");
      return;
    }

    setStatus("error");
  }

  if (status === "sent") {
    return (
      <div style={{ padding: 24, textAlign: "center", border: "1px solid var(--hair)", borderRadius: 10 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Got it.</h2>
        <p style={{ margin: 0, color: "var(--ash)" }}>I&apos;ll get back to you at the email you provided.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, width: "100%" }}>
      <input
        required
        placeholder="Your name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        style={inputStyle}
      />
      <input
        required
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Subject (optional)"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        style={inputStyle}
      />
      <textarea
        required
        placeholder="What's on your mind?"
        rows={6}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={5000}
        style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
      />
      <button type="submit" disabled={status === "sending"} style={buttonStyle}>
        {status === "sending" ? "Sending..." : "Send"}
      </button>
      {status === "error" && (
        <p style={{ color: "salmon" }}>
          Something failed. Try again or email support@redlineinvoices.com.
        </p>
      )}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "white",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 16px",
  background: "#ff4b3e",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};
