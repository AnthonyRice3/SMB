/**
 * POST /api/admin/migrate-stripe-live
 *
 * One-shot migration endpoint to clear all test-mode Stripe IDs from every
 * client document so live mode works cleanly.
 *
 * What it does:
 *   - Unsets stripeAccountId, stripeCustomerId, stripeSubscriptionId
 *   - Resets stripeOnboardingComplete → false
 *   - Resets plan → "Free" (test-mode subscriptions were fake / no real charge)
 *
 * After running this:
 *   - Clients re-do Stripe Connect Express onboarding via /dashboard/pipeline
 *   - Clients re-subscribe to a paid plan via /pricing if they want one
 *
 * Admin-only. Returns a dry-run preview when ?dryRun=true.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getClientsCollection } from "@/lib/db/client-db";

async function requireAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "true";

  try {
    const clients = await getClientsCollection();

    // Preview: find all docs that have at least one stale Stripe field
    const affected = await clients
      .find({
        $or: [
          { stripeAccountId: { $exists: true } },
          { stripeCustomerId: { $exists: true } },
          { stripeSubscriptionId: { $exists: true } },
          { stripeOnboardingComplete: true },
          { plan: { $in: ["Starter", "Growth", "Pro"] } },
        ],
      })
      .project({ clientId: 1, name: 1, email: 1, plan: 1, stripeAccountId: 1, stripeCustomerId: 1, stripeSubscriptionId: 1, stripeOnboardingComplete: 1 })
      .toArray();

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        willAffect: affected.length,
        clients: affected.map((c) => ({
          clientId: c.clientId,
          name: c.name,
          email: c.email,
          currentPlan: c.plan,
          stripeAccountId: c.stripeAccountId ?? null,
          stripeCustomerId: c.stripeCustomerId ?? null,
          stripeSubscriptionId: c.stripeSubscriptionId ?? null,
          stripeOnboardingComplete: c.stripeOnboardingComplete ?? false,
        })),
      });
    }

    // Live run: clear all stale Stripe fields on every client
    const result = await clients.updateMany(
      {},
      {
        $set: {
          plan: "Free",
          stripeOnboardingComplete: false,
          updatedAt: new Date(),
        },
        $unset: {
          stripeAccountId: "",
          stripeCustomerId: "",
          stripeSubscriptionId: "",
        },
      }
    );

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      message: `Cleared test-mode Stripe IDs from ${result.modifiedCount} client(s). All plans reset to Free.`,
    });
  } catch (err) {
    console.error("[migrate-stripe-live]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
