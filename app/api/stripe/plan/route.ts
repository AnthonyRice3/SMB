/**
 * POST /api/stripe/plan
 *
 * Creates a Stripe Checkout Session for a SAGAH platform subscription
 * (Starter / Growth / Pro, monthly or annual).
 *
 * Body:
 *   planId   — "starter" | "growth" | "pro"
 *   interval — "month" | "year"
 *
 * Returns: { url: string } — the Stripe Checkout hosted page URL
 *
 * ─── Stripe setup required ────────────────────────────────────────────────
 *  Create 6 recurring prices in Stripe Dashboard and add their IDs to .env:
 *
 *   STRIPE_STARTER_MONTHLY_PRICE_ID   → $10.00 / month
 *   STRIPE_STARTER_ANNUAL_PRICE_ID    → $90.00 / year  (equiv. $7.50/mo)
 *   STRIPE_GROWTH_MONTHLY_PRICE_ID    → $20.00 / month
 *   STRIPE_GROWTH_ANNUAL_PRICE_ID     → $180.00 / year (equiv. $15.00/mo)
 *   STRIPE_PRO_MONTHLY_PRICE_ID       → $35.00 / month
 *   STRIPE_PRO_ANNUAL_PRICE_ID        → $315.00 / year (equiv. $26.25/mo)
 * ──────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getClientsCollection } from "@/lib/db/client-db";

type Plan = "starter" | "growth" | "pro";
type Interval = "month" | "year";

const PRICE_ID_MAP: Record<Plan, Record<Interval, string>> = {
  starter: {
    month: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? "",
    year: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? "",
  },
  growth: {
    month: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ?? "",
    year: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID ?? "",
  },
  pro: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
    year: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://sagah.xyz";

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { planId, interval } = body as { planId?: string; interval?: string };

    if (!planId || !["starter", "growth", "pro"].includes(planId)) {
      return NextResponse.json({ error: "planId must be starter, growth, or pro" }, { status: 400 });
    }
    if (!interval || !["month", "year"].includes(interval)) {
      return NextResponse.json({ error: "interval must be month or year" }, { status: 400 });
    }

    const priceId = PRICE_ID_MAP[planId as Plan][interval as Interval];
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID for ${planId}/${interval} is not configured` },
        { status: 500 }
      );
    }

    // Get the Clerk user's email to pre-fill checkout
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    // Find or create a Stripe customer linked to this Clerk user
    const clients = await getClientsCollection();
    const client = await clients.findOne({ clerkUserId: userId });

    let customerId: string | undefined;

    if (client?.stripeCustomerId) {
      customerId = client.stripeCustomerId;
    } else if (email) {
      // Look up by email first to avoid duplicate customers
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || undefined,
          metadata: { sagah_clerk_user_id: userId },
        });
        customerId = customer.id;
      }
      // Persist for future calls
      if (client) {
        await clients.updateOne(
          { clerkUserId: userId },
          { $set: { stripeCustomerId: customerId, updatedAt: new Date() } }
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/dashboard?plan=${planId}&subscribed=1`,
      cancel_url: `${BASE_URL}/pricing?cancelled=1`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          sagah_clerk_user_id: userId,
          sagah_plan: planId,
          sagah_interval: interval,
        },
      },
      metadata: {
        sagah_clerk_user_id: userId,
        sagah_plan: planId,
        sagah_interval: interval,
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/plan]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
