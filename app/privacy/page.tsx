import { LegalPage } from "@/components/legal-page";

const privacyText = `PRIVACY POLICY

Last updated: 25 April 2026

This Privacy Policy explains how RedLine ("we", "us", "our"), accessible at redlineinvoices.com, collects, uses, stores, and discloses personal information.

We are committed to handling personal information in accordance with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).

If you have questions about this policy, contact us at support@redlineinvoices.com.


1. WHAT INFORMATION WE COLLECT

We collect three categories of information.

a) Information you give us directly:

- Name, email address, and password when you create an account.
- Business name, ABN, address, and other business details you add to your profile.
- Payment information (card details are handled by Stripe — we do not store full card numbers).
- Invoice data you upload or create in the Service, including amounts, due dates, and line items.
- Client contact details you provide (names and email addresses of your invoice recipients).
- Support enquiries and correspondence you send to us.

b) Information collected automatically:

- Log data: IP address, browser type, pages visited, timestamps, and referring URLs when you access the Service.
- Device information: operating system, device type, and browser version.
- Cookies and similar tracking technologies (see Section 8).
- Usage data: features you use, actions you take, and frequency of use.

c) Information from third parties:

- Payment confirmation and status information from Stripe.
- Authentication tokens from Supabase when you log in.


2. HOW WE USE YOUR INFORMATION

We use your information to:

- Create and manage your account.
- Provide the Service, including sending automated follow-up emails to your clients on your behalf.
- Process payments and manage your subscription.
- Send you transactional emails (account confirmation, password reset, invoices).
- Send you service-related notifications (downtime alerts, policy updates).
- Respond to your support requests.
- Monitor and improve the reliability and performance of the Service.
- Detect and prevent fraud, abuse, and security incidents.
- Comply with our legal obligations.

We do not sell your personal information to third parties. We do not use your data to train machine-learning models.


3. YOUR CLIENT DATA

When you use RedLine you provide contact information for your clients (invoice recipients). This is personal information about third parties.

- You are the data controller for your clients' data. We are your data processor.
- We use your clients' data only to send emails on your instructions.
- We do not use your clients' data for our own marketing or any other purpose.
- You are responsible for ensuring you have a lawful basis to share your clients' contact details with us and to send them emails using the Service.


4. SUB-PROCESSORS

We share data with the following third-party service providers to operate the Service. Each acts as a sub-processor under our instructions.

- Supabase (Supabase Inc.): database storage and user authentication. Data shared: account data, invoice data, client contact details. Privacy policy: supabase.com/privacy.
- Vercel (Vercel Inc.): cloud hosting and edge functions. Data shared: log data and request metadata. Privacy policy: vercel.com/legal/privacy-policy.
- Stripe (Stripe, Inc.): payment processing. Data shared: payment card details and billing information. Privacy policy: stripe.com/privacy.
- Resend (Resend Inc.): transactional email delivery. Data shared: email addresses and email content of outbound messages. Privacy policy: resend.com/legal/privacy-policy.
- Cloudflare (Cloudflare, Inc.): DNS, CDN, and security (DDoS protection, WAF). Data shared: IP addresses and request metadata. Privacy policy: cloudflare.com/privacypolicy.

We require all sub-processors to protect your data in a manner consistent with this policy. We do not authorise any sub-processor to use your data for their own purposes beyond what is needed to provide their service to us.


5. DATA RETENTION

We retain your data for as long as your account is active and for 30 days after termination, during which time you can export your data.

After 30 days we delete your account data from our active systems. Some data may be retained in backups for a limited period after deletion from active systems.

We may retain certain data longer where required by law (for example, financial records for tax purposes).

Log and usage data is typically retained for up to 90 days.


6. YOUR RIGHTS

Under the Australian Privacy Act and the Australian Privacy Principles you have the right to:

- Access the personal information we hold about you.
- Request correction of inaccurate or incomplete information.
- Request deletion of your personal information (subject to legal retention requirements).
- Make a complaint about how we have handled your information.

To exercise any of these rights, contact us at support@redlineinvoices.com. We will respond within 30 days.

If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.


7. SECURITY

We take reasonable technical and organisational measures to protect your personal information from unauthorised access, disclosure, alteration, or destruction. These include:

- Encryption of data in transit (TLS) and at rest.
- Access controls limiting who can access production data.
- Use of established third-party infrastructure providers with strong security track records.

No method of transmission or storage is 100% secure. We cannot guarantee absolute security. If we become aware of a data breach that is likely to result in serious harm, we will notify affected users and the OAIC in accordance with the Notifiable Data Breaches scheme.


8. COOKIES

We use cookies and similar technologies to:

- Keep you logged in during your session (essential cookies).
- Understand how users interact with the Service (analytics).

You can control cookies through your browser settings. Disabling essential cookies will prevent you from using the Service.

We do not use third-party advertising cookies.


9. CHILDREN

The Service is not directed at children under 18. We do not knowingly collect personal information from anyone under 18. If you believe we have inadvertently collected such information, contact us and we will delete it promptly.


10. INTERNATIONAL DATA TRANSFERS

Our sub-processors (Supabase, Vercel, Stripe, Resend, Cloudflare) are based primarily in the United States and may store or process data outside Australia. By using the Service you consent to these transfers. We select sub-processors that apply data protection standards equivalent to or exceeding Australian requirements.


11. LINKS TO OTHER WEBSITES

The Service may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies.


12. CHANGES TO THIS POLICY

We may update this Privacy Policy from time to time. If we make material changes we will notify you by email or by a prominent notice in the Service before the changes take effect.

The "last updated" date at the top of this policy reflects when it was last revised. Continued use of the Service after a change constitutes acceptance of the updated policy.


13. CONTACT

For privacy questions, access requests, or complaints:

Email: support@redlineinvoices.com
Website: redlineinvoices.com
New South Wales, Australia`;

export default function PrivacyPage() {
  return <LegalPage raw={privacyText} />;
}
