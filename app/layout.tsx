import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://redlineinvoices.com"),
  title: {
    default: "Redline — Get paid without chasing",
    template: "%s · Redline",
  },
  description: "Send the invoice. Redline watches the inbox, follows up on the right days, and gets firmer if it slips. Friendly first, late fees applied automatically.",
  keywords: [
    "invoice follow-up",
    "automated invoice reminders",
    "small business invoicing",
    "freelance invoicing",
    "late payment automation",
    "Australian invoicing software",
  ],
  openGraph: {
    title: "Redline — Get paid without chasing",
    description: "Automated invoice follow-ups for small service businesses. You send once. Redline does the awkward part.",
    url: "https://redlineinvoices.com",
    siteName: "Redline",
    images: [{ url: "/assets/redline-banner.png", width: 1500, height: 500, alt: "Redline" }],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redline — Get paid without chasing",
    description: "Automated invoice follow-ups for small service businesses.",
    images: ["/assets/redline-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Script
          defer
          data-domain="redlineinvoices.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
