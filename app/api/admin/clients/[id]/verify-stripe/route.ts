/**
 * POST /api/admin/clients/[id]/verify-stripe
 * Admin-only: retrieve the Stripe account for a client and mark
 * stripeOnboardingComplete = true if charges_enabled.
 * Also accepts a body with { stripeAccountId } to set/override the account ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { stripe } from "@/lib/stripe";
import { getClientsCollection } from "@/lib/db/client-db";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const clients = await getClientsCollection();
    const client = await clients.findOne({ _id: new ObjectId(id) });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({})) as { stripeAccountId?: string };

    // Allow admin to set/override the account ID
    let accountId = client.stripeAccountId;
    if (body.stripeAccountId) {
      accountId = body.stripeAccountId;
      await clients.updateOne(
        { _id: new ObjectId(id) },
        { $set: { stripeAccountId: accountId, updatedAt: new Date() } }
      );
    }

    if (!accountId) {
      return NextResponse.json({ error: "No Stripe account ID on this client" }, { status: 422 });
    }

    // Check Stripe directly
    const account = await stripe.accounts.retrieve(accountId);
    const chargesEnabled = account.charges_enabled ?? false;

    await clients.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          stripeAccountId: accountId,
          stripeOnboardingComplete: chargesEnabled,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      chargesEnabled,
      detailsSubmitted: account.details_submitted ?? false,
      stripeAccountId: accountId,
    });
  } catch (err) {
    console.error("[admin/verify-stripe]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
