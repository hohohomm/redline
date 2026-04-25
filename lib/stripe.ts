import Stripe from "stripe";

// Lazy singleton — instantiated on first call, not at module load.
// Avoids "no apiKey" crash during Next.js build when env vars aren't present.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

type CreateInvoiceCheckoutUrlArgs = {
  invoiceId: string;
  total: number | string;
  appUrl: string;
  clientName?: string | null;
};

export async function createInvoiceCheckoutUrl({
  invoiceId,
  total,
  appUrl,
  clientName,
}: CreateInvoiceCheckoutUrlArgs): Promise<string> {
  const baseUrl = appUrl.replace(/\/$/, "");
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: clientName ? `Invoice for ${clientName}` : `Invoice ${invoiceId}`,
          },
          unit_amount: Math.round(Number(total) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id: invoiceId,
    },
    success_url: `${baseUrl}/paid`,
    cancel_url: baseUrl,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session.url;
}
