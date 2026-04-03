/**
 * POST /api/stripe/connect
 *
 * Creates a Stripe Express connected account for a client and returns
 * an onboarding URL. If the client already has an account, generates
 * a fresh account link so they can complete/re-enter onboarding.
 *
 * Body: { clientId: string; email: string; name: string }
 * Returns: { url: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getClientsCollection } from "@/lib/db/client-db";

export async function POST(req: NextRequest) {
  try {
    const { clientId, email, name } = await req.json();

    if (!clientId || !email || !name) {
      return NextResponse.json(
        { error: "clientId, email, and name are required" },
        { status: 400 }
      );
    }

    const clients = await getClientsCollection();
    const client = await clients.findOne({ clientId });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let accountId = client.stripeAccountId;

    // Create a new Express account if one doesn't exist yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email,
        business_profile: { name },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { sagah_client_id: clientId },
      });

      accountId = account.id;

      await clients.updateOne(
        { clientId },
        {
          $set: {
            stripeAccountId: accountId,
            stripeOnboardingComplete: false,
            updatedAt: new Date(),
          },
        }
      );
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Generate a fresh onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/pipeline?stripe=refresh`,
      return_url: `${origin}/dashboard/pipeline?stripe=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("[stripe/connect]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
