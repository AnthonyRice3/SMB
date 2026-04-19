/**
 * GET /api/stripe/verify-checkout?session_id=cs_xxx
 *
 * Called client-side immediately after Stripe redirects the user back to
 * the success URL. Retrieves the checkout session, verifies payment status,
 * and immediately updates the client's plan in MongoDB so the UI reflects
 * the change without waiting for a webhook.
 *
 * The Stripe webhook remains the authoritative source, but this endpoint
 * eliminates the race-condition where the user sees the old plan on load.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getClientsCollection } from "@/lib/db/client-db";
import type { PlanTier } from "@/lib/stripe";

const PLAN_NAME_MAP: Record<string, PlanTier> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  try {
    // Retrieve session from Stripe with the subscription expanded
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    // Verify the session belongs to this user
    const sessionClerkUserId = session.metadata?.sagah_clerk_user_id;
    if (sessionClerkUserId && sessionClerkUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Payment not complete" }, { status: 402 });
    }

    const sagahPlan = session.metadata?.sagah_plan;
    if (!sagahPlan) {
      return NextResponse.json({ error: "Plan metadata missing" }, { status: 422 });
    }

    const plan = PLAN_NAME_MAP[sagahPlan];
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 422 });
    }

    const sub = session.subscription as import("stripe").Stripe.Subscription | null;
    const subscriptionId = sub?.id ?? undefined;

    // Update plan in DB immediately
    const clients = await getClientsCollection();
    await clients.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          plan,
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ plan, subscriptionId: subscriptionId ?? null });
  } catch (err) {
    console.error("[verify-checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
