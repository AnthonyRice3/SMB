/**
 * POST /api/stripe/connect/verify
 *
 * Called immediately after a client returns from Stripe Express onboarding.
 * Retrieves the account from Stripe and marks stripeOnboardingComplete = true
 * in the DB if charges_enabled is true.
 *
 * This eliminates the race condition where the account.updated webhook hasn't
 * fired yet (common in test mode).
 *
 * Auth: Clerk (authenticated client only — updates their own record)
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getClientsCollection } from "@/lib/db/client-db";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clients = await getClientsCollection();
    const client = await clients.findOne({ clerkUserId: userId });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.stripeAccountId) {
      return NextResponse.json({ error: "No Stripe account linked" }, { status: 422 });
    }

    // Already marked complete — nothing to do
    if (client.stripeOnboardingComplete) {
      return NextResponse.json({ complete: true, chargesEnabled: true });
    }

    // Check live status from Stripe
    const account = await stripe.accounts.retrieve(client.stripeAccountId);
    const chargesEnabled = account.charges_enabled ?? false;

    if (chargesEnabled) {
      await clients.updateOne(
        { clerkUserId: userId },
        { $set: { stripeOnboardingComplete: true, updatedAt: new Date() } }
      );
    }

    return NextResponse.json({
      complete: chargesEnabled,
      chargesEnabled,
      detailsSubmitted: account.details_submitted ?? false,
    });
  } catch (err) {
    console.error("[stripe/connect/verify]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
