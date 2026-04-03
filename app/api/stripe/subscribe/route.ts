/**
 * POST /api/stripe/subscribe
 *
 * Creates or retrieves the $25/month seat subscription for a SAGAH client
 * whose end-user count has exceeded the free-tier limit of 25 users.
 *
 * This subscription is charged directly to the client (not through Connect).
 * A Stripe Customer record is created for the client on first call.
 *
 * Body:
 *   clientId  — SAGAH client ID
 *   userCount — current end-user count for this client's app
 *
 * Returns:
 *   { subscriptionId, clientSecret, status, alreadySubscribed }
 *
 * ─── Stripe setup required ────────────────────────────────────────────────
 *  1. Create a recurring price in the Stripe Dashboard: $25.00 / month
 *  2. Copy the price ID (price_xxx) into .env as STRIPE_SEAT_PRICE_ID
 * ──────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe, requiresSeatSubscription } from "@/lib/stripe";
import { getClientsCollection } from "@/lib/db/client-db";

export async function POST(req: NextRequest) {
  try {
    const { clientId, userCount } = await req.json();

    if (!clientId || typeof userCount !== "number") {
      return NextResponse.json(
        { error: "clientId and userCount are required" },
        { status: 400 }
      );
    }

    // Only subscribe if user count exceeds the free seat limit (25)
    if (!requiresSeatSubscription(userCount)) {
      return NextResponse.json({
        alreadySubscribed: false,
        required: false,
        message: `Under the ${25}-user free limit — no subscription needed`,
      });
    }

    if (!process.env.STRIPE_SEAT_PRICE_ID) {
      throw new Error("STRIPE_SEAT_PRICE_ID is not configured");
    }

    const clients = await getClientsCollection();
    const client = await clients.findOne({ clientId });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // If the client already has an active subscription, return it
    if (client.stripeSubscriptionId) {
      const existing = await stripe.subscriptions.retrieve(client.stripeSubscriptionId);
      if (existing.status === "active" || existing.status === "trialing") {
        return NextResponse.json({
          subscriptionId: existing.id,
          status: existing.status,
          alreadySubscribed: true,
        });
      }
    }

    // Create or retrieve a Stripe Customer for this client
    let customerId = client.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        name: client.name,
        metadata: { sagah_client_id: clientId },
      });
      customerId = customer.id;

      await clients.updateOne(
        { clientId },
        { $set: { stripeCustomerId: customerId, updatedAt: new Date() } }

      );
    }

    // Create the $25/month subscription with payment_behavior = default_incomplete
    // so a PaymentIntent is returned for the client to confirm their card.
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_SEAT_PRICE_ID }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { sagah_client_id: clientId },
    });

    // Persist the subscription ID
    await clients.updateOne(
      { clientId },
      {
        $set: {
          stripeSubscriptionId: subscription.id,
          updatedAt: new Date(),
        },
      }
    );

    // Extract client_secret so the frontend can confirm payment
    const invoice = subscription.latest_invoice as import("stripe").Stripe.Invoice & {
      payment_intent: import("stripe").Stripe.PaymentIntent | null;
    };
    const paymentIntent = invoice.payment_intent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret ?? null,
      status: subscription.status,
      alreadySubscribed: false,
    });
  } catch (err) {
    console.error("[stripe/subscribe]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
