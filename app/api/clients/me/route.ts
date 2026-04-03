/**
 * GET /api/clients/me
 *
 * Returns the MongoDB ClientDoc for the currently authenticated Clerk user.
 * The lookup uses clerkUserId so the response is always scoped to the caller.
 *
 * Returns 404 if no client record exists yet (e.g. webhook hasn't fired).
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientsCollection } from "@/lib/db/client-db";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = await getClientsCollection();
    const client = await clients.findOne(
      { clerkUserId: userId },
      {
        projection: {
          _id: 0,
          clientId: 1,
          name: 1,
          email: 1,
          plan: 1,
          status: 1,
          pipelineStage: 1,
          stripeAccountId: 1,
          stripeOnboardingComplete: 1,
          stripeSubscriptionId: 1,
          collectionsProvisioned: 1,
          createdAt: 1,
        },
      }
    );

    if (!client) {
      return NextResponse.json({ error: "Client record not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (err) {
    console.error("[GET /api/clients/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
