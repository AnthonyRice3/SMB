/**
 * POST /api/v1/payments/checkout
 *
 * Create a Stripe PaymentIntent for the calling client's Express account.
 * SAGAH automatically collects a 10% platform fee.
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Body:
 *   amount    — required, amount in cents (min 50 = $0.50)
 *   currency  — optional, default "usd"
 *   metadata  — optional, key-value pairs forwarded to Stripe
 *
 * Returns: { clientSecret, paymentIntentId, fee }
 * Use the clientSecret in Stripe.js on the frontend to complete the payment.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { stripe, platformFee, PlanTier } from "@/lib/stripe";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  if (!client.stripeAccountId || !client.stripeOnboardingComplete) {
    return NextResponse.json(
      { error: "Stripe account not set up — complete onboarding in your SAGAH dashboard" },
      { status: 422, headers: corsHeaders }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { amount, currency = "usd", metadata = {} } = body as Record<string, unknown>;

  if (typeof amount !== "number" || amount < 50) {
    return NextResponse.json(
      { error: "amount must be a number in cents (minimum 50)" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const fee = platformFee(amount, (client.plan as PlanTier) ?? "Free");
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: String(currency),
      application_fee_amount: fee,
      transfer_data: { destination: client.stripeAccountId },
      metadata: {
        sagah_client_id: client.clientId,
        ...(typeof metadata === "object" && metadata !== null ? metadata as Record<string, string> : {}),
      },
    });

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        fee,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("[POST /api/v1/payments/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
