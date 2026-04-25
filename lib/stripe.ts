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
