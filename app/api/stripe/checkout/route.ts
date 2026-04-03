/**
 * POST /api/stripe/checkout
 *
 * Creates a PaymentIntent for a one-time charge processed through a client's
 * Express connected account. SAGAH automatically collects a 10% platform fee.
 *
 * Body:
 *   clientId  — SAGAH client whose Express account will receive the payment
 *   amount    — amount in cents (e.g. 5000 = $50.00)
 *   currency  — ISO currency code (default: "usd")
 *   metadata  — optional key/value pairs forwarded to Stripe
 *
 * Returns: { clientSecret: string; paymentIntentId: string; fee: number }
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe, platformFee } from "@/lib/stripe";
import { getClientsCollection } from "@/lib/db/client-db";

export async function POST(req: NextRequest) {
  try {
    const { clientId, amount, currency = "usd", metadata = {} } = await req.json();

    if (!clientId || !amount || typeof amount !== "number" || amount < 50) {
      return NextResponse.json(
        { error: "clientId and amount (minimum 50 cents) are required" },
        { status: 400 }
      );
    }

    const clients = await getClientsCollection();
    const client = await clients.findOne({ clientId });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.stripeAccountId || !client.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: "Client has not completed Stripe onboarding" },
        { status: 422 }
      );
    }

    const fee = platformFee(amount); // 10%

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: fee,
      transfer_data: {
        destination: client.stripeAccountId,
      },
      metadata: {
        sagah_client_id: clientId,
        ...metadata,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      fee,
    });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
