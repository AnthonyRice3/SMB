/**
 * POST /api/v1/payments/checkout
 *
 * Creates a payment for the calling client's Stripe Express account.
 * SAGAH automatically collects a platform fee based on the client's plan.
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Body (hosted checkout — recommended, no Stripe.js required on your site):
 *   hosted      — true
 *   amount      — required, amount in cents (min 50 = $0.50)
 *   successUrl  — required, URL to redirect to after payment
 *   cancelUrl   — required, URL to redirect to if customer cancels
 *   productName — optional, line item label shown on the Stripe checkout page (default: "Payment")
 *   currency    — optional, default "usd"
 *   metadata    — optional, key-value pairs forwarded to Stripe
 *
 * Returns (hosted): { url } — redirect the customer to this Stripe-hosted checkout page
 *
 * Body (custom UI — requires Stripe.js + Elements on your frontend):
 *   hosted      — false or omitted
 *   amount      — required, amount in cents (min 50 = $0.50)
 *   currency    — optional, default "usd"
 *   metadata    — optional
 *
 * Returns (custom): { clientSecret, paymentIntentId, fee }
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
      {
        error:
          "Stripe account not connected. Go to https://sagah.xyz/dashboard/pipeline and connect your Stripe account, then retry.",
      },
      { status: 422, headers: corsHeaders }
    );
  }

  const body = await req.json().catch(() => ({}));
  const {
    hosted = false,
    amount,
    currency = "usd",
    metadata = {},
    productName = "Payment",
    successUrl,
    cancelUrl,
  } = body as Record<string, unknown>;

  if (typeof amount !== "number" || amount < 50) {
    return NextResponse.json(
      { error: "amount must be a number in cents (minimum 50)" },
      { status: 400, headers: corsHeaders }
    );
  }

  const safeMetadata =
    typeof metadata === "object" && metadata !== null
      ? (metadata as Record<string, string>)
      : {};

  try {
    const fee = platformFee(amount, (client.plan as PlanTier) ?? "Free");

    if (hosted) {
      if (!successUrl || !cancelUrl) {
        return NextResponse.json(
          { error: "successUrl and cancelUrl are required for hosted checkout" },
          { status: 400, headers: corsHeaders }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: String(currency),
              unit_amount: amount,
              product_data: { name: String(productName) },
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: fee,
          transfer_data: { destination: client.stripeAccountId },
          metadata: { sagah_client_id: client.clientId, ...safeMetadata },
        },
        success_url: String(successUrl),
        cancel_url: String(cancelUrl),
      });

      return NextResponse.json({ url: session.url, fee, resolvedClient: { clientId: client.clientId, name: client.name, email: client.email } }, { headers: corsHeaders });
    }

    // --- PaymentIntent (custom UI) ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: String(currency),
      application_fee_amount: fee,
      transfer_data: { destination: client.stripeAccountId },
      metadata: { sagah_client_id: client.clientId, ...safeMetadata },
    });

    return NextResponse.json(
      { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, fee, resolvedClient: { clientId: client.clientId, name: client.name, email: client.email } },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("[POST /api/v1/payments/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
