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
 *   customer.subscription.created  — sets client.plan when platform subscription activates
 *   customer.subscription.updated  — syncs client.plan on upgrades/downgrades
 *   customer.subscription.deleted — resets client.plan to Free on cancellation
 *
 * ─── Stripe setup required ────────────────────────────────────────────────
 *  Stripe Dashboard → Developers → Webhooks → Add endpoint
 *  URL : https://yourdomain.com/api/stripe/webhook
 *  Events to send:
 *    payment_intent.succeeded
 *    payment_intent.payment_failed
 *    account.updated
 *    customer.subscription.created
 *    customer.subscription.updated
 *    customer.subscription.deleted
 * ──────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import type { PlanTier } from "@/lib/stripe";
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
        const linkedUserId = pi.metadata?.user_id ?? pi.metadata?.clerk_user_id;
        await revenue.insertOne({
          stripePaymentIntentId: pi.id,
          ...(linkedUserId ? { userId: linkedUserId } : {}),
          amount: pi.amount,
          currency: pi.currency,
          type: "one_time",
          ...(pi.metadata?.sagah_plan ? { plan: pi.metadata.sagah_plan } : {}),
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
        const linkedUserId = pi.metadata?.user_id ?? pi.metadata?.clerk_user_id;
        await revenue.insertOne({
          stripePaymentIntentId: pi.id,
          ...(linkedUserId ? { userId: linkedUserId } : {}),
          amount: pi.amount,
          currency: pi.currency,
          type: "one_time",
          ...(pi.metadata?.sagah_plan ? { plan: pi.metadata.sagah_plan } : {}),
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

      // ── Platform plan subscription activated / upgraded / downgraded ─────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.sagah_clerk_user_id;
        const sagahPlan = sub.metadata?.sagah_plan;

        if (!clerkUserId || !sagahPlan) break;
        if (sub.status !== "active" && sub.status !== "trialing") break;

        const PLAN_NAME_MAP: Record<string, PlanTier> = {
          starter: "Starter",
          growth: "Growth",
          pro: "Pro",
        };
        const plan = PLAN_NAME_MAP[sagahPlan];
        if (!plan) break;

        const clients = await getClientsCollection();
        await clients.updateOne(
          { clerkUserId },
          { $set: { plan, stripeSubscriptionId: sub.id, updatedAt: new Date() } }
        );
        break;
      }

      // ── Platform plan subscription cancelled ─────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.sagah_clerk_user_id;
        const clientId = sub.metadata?.sagah_client_id;

        const clients = await getClientsCollection();

        if (clerkUserId) {
          // Platform plan cancelled — downgrade to Free
          await clients.updateOne(
            { clerkUserId },
            { $set: { plan: "Free" as PlanTier, stripeSubscriptionId: undefined, updatedAt: new Date() } }
          );
        } else if (clientId) {
          // Legacy seat subscription cancelled
          await clients.updateOne(
            { clientId },
            { $set: { stripeSubscriptionId: undefined, updatedAt: new Date() } }
          );
        }
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
