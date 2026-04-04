/**
 * POST /api/stripe/webhook
 *
 * Receives and verifies Stripe webhook events. Uses the raw request body and
 * STRIPE_WEBHOOK_SECRET to validate the signature before processing.
 *
 * Handled events:
 *   payment_intent.succeeded    — writes revenue record to {clientId}_app_revenue
 *   payment_intent.payment_failed
 *   account.updated             — marks stripeOnboardingComplete when charges_enabled
 *   customer.subscription.deleted — clears stripeSubscriptionId on cancellation
 *
 * ─── Stripe setup required ────────────────────────────────────────────────
 *  Stripe Dashboard → Developers → Webhooks → Add endpoint
 *  URL : https://yourdomain.com/api/stripe/webhook
 *  Events to send:
 *    payment_intent.succeeded
 *    payment_intent.payment_failed
 *    account.updated
 *    customer.subscription.deleted
 * ──────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getClientsCollection, getAppRevenueCollection } from "@/lib/db/client-db";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Payment succeeded ──────────────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const clientId = pi.metadata?.sagah_client_id;
        if (!clientId) break;

        const revenue = await getAppRevenueCollection(clientId);
        await revenue.insertOne({
          stripePaymentIntentId: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          type: "one_time",
          status: "succeeded",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as never); // typed via AppRevenueDoc in schema.ts
        break;
      }

      // ── Payment failed ──────────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const clientId = pi.metadata?.sagah_client_id;
        if (!clientId) break;

        const revenue = await getAppRevenueCollection(clientId);
        await revenue.insertOne({
          stripePaymentIntentId: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          type: "one_time",
          status: "failed",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as never);
        break;
      }

      // ── Express account onboarding complete ─────────────────────────────
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (!account.charges_enabled) break;

        const clients = await getClientsCollection();
        await clients.updateOne(
          { stripeAccountId: account.id },
          { $set: { stripeOnboardingComplete: true, updatedAt: new Date() } }
        );
        break;
      }

      // ── Seat subscription cancelled ──────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clientId = sub.metadata?.sagah_client_id;
        if (!clientId) break;

        const clients = await getClientsCollection();
        await clients.updateOne(
          { clientId },
          { $set: { stripeSubscriptionId: undefined, updatedAt: new Date() } }
        );
        break;
      }

      default:
        // Unhandled event — acknowledged but ignored
        break;
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
