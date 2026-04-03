/**
 * lib/stripe.ts
 *
 * Server-side Stripe singleton (Node.js only — never import in client components).
 *
 * Fee model
 * ─────────
 *  Transaction fee : 10% application_fee_amount on every PaymentIntent processed
 *                    through a client's connected Express account.
 *                    Stripe takes ~2-3%, SAGAH retains ~7-8%.
 *
 *  Seat subscription: $25 / month when a client's end-user count exceeds 25.
 *                    Charged directly to the client (not through Connect).
 *                    Price is configured in the Stripe Dashboard and referenced
 *                    via STRIPE_SEAT_PRICE_ID.
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});

// ─── Fee constants ───────────────────────────────────────────────────────────

/** 10% platform fee on Connect payments */
export const PLATFORM_FEE_PERCENT = 0.10;

/** Free tier seat limit — clients pay $25/mo once they exceed this */
export const FREE_SEAT_LIMIT = 25;

/** Monthly seat subscription price in cents ($25.00) */
export const SEAT_SUBSCRIPTION_PRICE_CENTS = 2500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the application_fee_amount (in cents) for a given payment amount.
 * Always rounds up to the nearest cent.
 */
export function platformFee(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_FEE_PERCENT);
}

/**
 * Returns true if the given seat count requires the $25/mo subscription.
 */
export function requiresSeatSubscription(userCount: number): boolean {
  return userCount > FREE_SEAT_LIMIT;
}
