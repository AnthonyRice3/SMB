/**
 * GET /api/admin/stripe-volume
 *
 * Returns Stripe gross volume data for the admin monetization panel:
 *   - grossVolume        — total amount processed across all balance transactions (last 6 months)
 *   - netVolume          — gross minus Stripe fees
 *   - platformFees       — application fees collected (SAGAH's cut)
 *   - subscriptionMrr   — live MRR from active platform subscriptions
 *   - monthlyGross       — per-month gross volume array (last 6 months, oldest → newest)
 *   - recentCharges      — last 20 successful charges with metadata
 */

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import {
  getAppRevenueCollection,
  getAppUsersCollection,
} from "@/lib/db/client-db";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

function monthKey(ts: number) {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last6MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sixMonthsAgo = Math.floor(
      new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).getTime() / 1000
    );

    // ── 1. Balance transactions (all charge types, last 6 months) ─────────
    const balanceTxns = await stripe.balanceTransactions.list({
      limit: 100,
      created: { gte: sixMonthsAgo },
      type: "charge",
    });

    let grossVolume = 0;
    let netVolume = 0;
    const monthlyGrossMap: Record<string, number> = {};

    for (const txn of balanceTxns.data) {
      grossVolume += txn.amount;
      netVolume += txn.net;
      const key = monthKey(txn.created);
      monthlyGrossMap[key] = (monthlyGrossMap[key] ?? 0) + txn.amount;
    }

    const monthKeys = last6MonthKeys();
    const monthlyGross = monthKeys.map((k) => Math.round((monthlyGrossMap[k] ?? 0) / 100));

    // ── 2. Application fees (SAGAH's platform cut from Connect transactions) ─
    const appFees = await stripe.applicationFees.list({
      limit: 100,
      created: { gte: sixMonthsAgo },
    });

    let platformFees = 0;
    for (const fee of appFees.data) {
      platformFees += fee.amount;
    }

    // ── 3. Subscription MRR from active platform subscriptions ────────────
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    let subscriptionMrr = 0;
    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        const amount = price.unit_amount ?? 0;
        if (price.recurring?.interval === "year") {
          subscriptionMrr += Math.round(amount / 12);
        } else {
          subscriptionMrr += amount;
        }
      }
    }

    // ── 4. Recent successful charges (expand payment_intent + customer for email) ─
    const charges = await stripe.charges.list({
      limit: 20,
      expand: ["data.payment_intent", "data.customer"],
    });

    const succeededCharges = charges.data.filter((c) => c.status === "succeeded");

    // ── 4a. Build a map: paymentIntentId → { userName, userEmail, userId }
    //        by cross-referencing MongoDB revenue docs + app users per client.
    type PiUser = { userName: string | null; userEmail: string | null; userId: string | null };
    const piUserMap: Record<string, PiUser> = {};

    // Group by sagah_client_id so we make one DB round-trip per client
    const clientPiIds: Record<string, string[]> = {};
    for (const c of succeededCharges) {
      const pi = typeof c.payment_intent === "object" && c.payment_intent !== null
        ? (c.payment_intent as import("stripe").Stripe.PaymentIntent)
        : null;
      const clientId = pi?.metadata?.sagah_client_id ?? c.metadata?.sagah_client_id;
      const piId = pi?.id ?? (typeof c.payment_intent === "string" ? c.payment_intent : null);
      if (clientId && piId) {
        (clientPiIds[clientId] ??= []).push(piId);
      }
    }

    await Promise.all(
      Object.entries(clientPiIds).map(async ([clientId, piIds]) => {
        const [revenueCol, usersCol] = await Promise.all([
          getAppRevenueCollection(clientId),
          getAppUsersCollection(clientId),
        ]);
        const revDocs = await revenueCol
          .find({ stripePaymentIntentId: { $in: piIds } })
          .toArray();
        const clerkIds = revDocs.map((r) => r.userId).filter(Boolean) as string[];
        const appUsers = clerkIds.length
          ? await usersCol.find({ clerkUserId: { $in: clerkIds } }).toArray()
          : [];
        const byClerkId = Object.fromEntries(
          appUsers.filter((u) => u.clerkUserId).map((u) => [u.clerkUserId!, u])
        );
        for (const r of revDocs) {
          if (!r.stripePaymentIntentId) continue;
          const user = r.userId ? byClerkId[r.userId] : undefined;
          piUserMap[r.stripePaymentIntentId] = {
            userName:  user?.name  ?? null,
            userEmail: user?.email ?? null,
            userId:    r.userId    ?? null,
          };
        }
      })
    );

    const recentCharges = succeededCharges.map((c) => {
      const pi = typeof c.payment_intent === "object" && c.payment_intent !== null
        ? (c.payment_intent as import("stripe").Stripe.PaymentIntent)
        : null;
      const sagahClientId = pi?.metadata?.sagah_client_id ?? c.metadata?.sagah_client_id ?? null;
      const piId = pi?.id ?? (typeof c.payment_intent === "string" ? c.payment_intent : null);

      // MongoDB revenue + user lookup takes priority over Stripe metadata
      const dbUser = piId ? piUserMap[piId] : null;

      const userName =
        dbUser?.userName ??
        pi?.metadata?.user_name ??
        pi?.metadata?.customer_name ??
        c.metadata?.user_name ??
        c.metadata?.customer_name ??
        null;

      const userId =
        dbUser?.userId ??
        pi?.metadata?.user_id ??
        pi?.metadata?.clerk_user_id ??
        c.metadata?.user_id ??
        c.metadata?.clerk_user_id ??
        null;

      // Use DB user email first, then metadata — do NOT fall back to receipt_email
      // or billing_details.email as those are often the platform account email.
      const customerEmail =
        dbUser?.userEmail ??
        pi?.metadata?.user_email ??
        pi?.metadata?.customer_email ??
        c.metadata?.user_email ??
        c.metadata?.customer_email ??
        null;

      return {
        id:             c.id,
        amount:         c.amount,
        currency:       c.currency,
        description:    c.description ?? pi?.metadata?.sagah_plan ?? null,
        customerEmail,
        customerName:   userName,
        customerUserId: userId,
        created:        c.created,
        sagahClientId,
      };
    });

    return NextResponse.json({
      grossVolume:     Math.round(grossVolume / 100),
      netVolume:       Math.round(netVolume / 100),
      platformFees:    Math.round(platformFees / 100),
      subscriptionMrr: Math.round(subscriptionMrr / 100),
      monthlyGross,
      monthLabels:     monthKeys.map((k) => {
        const [y, m] = k.split("-");
        return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", { month: "short" });
      }),
      recentCharges,
    });
  } catch (err) {
    console.error("[admin/stripe-volume]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
