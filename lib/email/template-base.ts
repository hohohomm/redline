export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type BuildEmailOptions = {
  title: string;
  intro: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Extra HTML block inserted between intro and footer (e.g. a pre-styled message body). */
  extraBlock?: string;
  /** Small print shown below the CTA. Falls back to empty string. */
  footer: string;
};

export function buildEmail({
  title,
  intro,
  ctaLabel,
  ctaUrl,
  extraBlock,
  footer,
}: BuildEmailOptions): string {
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<a href="${escapeHtml(ctaUrl)}" style="display:block;text-align:center;background:#ff4b3e;color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 18px;font-size:15px;font-weight:700;margin-bottom:0;">${escapeHtml(ctaLabel)}</a>`
      : "";

  const footerHtml = footer
    ? `<p style="margin:18px 0 0;color:#777274;font-size:12px;line-height:1.55;">${footer}</p>`
    : "";

  const extra = extraBlock ?? "";

  return `
<main style="margin:0;padding:0;background:#08090b;color:#f5f1ea;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#08090b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#101116;border:1px solid #2a2c33;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 18px;">
              <div style="display:inline-block;width:44px;height:44px;border-radius:12px;background:#08090b;overflow:hidden;border:1px solid #2a2c33;">
                <img src="https://redlineinvoices.com/assets/redline-icon.png" width="44" height="44" alt="Redline" style="display:block;width:44px;height:44px;" />
              </div>
              <h1 style="margin:22px 0 8px;font-size:28px;line-height:1.15;font-weight:500;letter-spacing:-0.03em;color:#f5f1ea;">${safeTitle}</h1>
              <p style="margin:0;color:#a6a2a0;font-size:15px;line-height:1.6;">${safeIntro}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              ${extra}
              ${ctaHtml}
              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</main>
  `.trim();
}
