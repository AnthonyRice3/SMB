/**
 * lib/stripe.ts
 *
 * Server-side Stripe singleton (Node.js only — never import in client components).
 *
 * Fee model
 * ─────────
 *  Transaction fee : applied as application_fee_amount on every PaymentIntent
 *                    processed through a client's Connect Express account.
 *                    Rate depends on the client's SAGAH platform plan:
 *                      Free       — 15%
 *                      Starter    — 10%
 *                      Growth     —  5%  (payment processing only)
 *                      Pro        —  0%
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

/** SAGAH platform plan tiers */
export type PlanTier = "Free" | "Starter" | "Growth" | "Pro" | "Enterprise";

/** Platform fee rates per plan (applied as Stripe application_fee_amount) */
export const PLAN_FEE_RATES: Record<PlanTier, number> = {
  Free:       0.15, // 15%
  Starter:    0.10, // 10%
  Growth:     0.05, //  5% — payment processing only
  Pro:        0.00, //  0%
  Enterprise: 0.00, //  0%
};

/** Free tier seat limit — clients pay $25/mo once they exceed this */
export const FREE_SEAT_LIMIT = 25;

/** Monthly seat subscription price in cents ($25.00) */
export const SEAT_SUBSCRIPTION_PRICE_CENTS = 2500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the application_fee_amount (in cents) for a given payment amount.
 * Uses the client's plan to determine the fee rate.
 * Defaults to Free (15%) when plan is unknown.
 */
export function platformFee(amountCents: number, plan: PlanTier = "Free"): number {
  const rate = PLAN_FEE_RATES[plan] ?? PLAN_FEE_RATES.Free;
  return Math.round(amountCents * rate);
}

/**
 * Returns true if the given seat count requires the $25/mo subscription.
 */
export function requiresSeatSubscription(userCount: number): boolean {
  return userCount > FREE_SEAT_LIMIT;
}
