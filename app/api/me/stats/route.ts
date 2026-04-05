/**
 * app/api/me/stats/route.ts
 *
 * GET /api/me/stats  — aggregated stats + analytics for the current client
 *
 * Returns:
 *   bookings  — count by status, upcoming list
 *   revenue   — MRR, total, last-12-months monthly array, recent transactions
 *   users     — total user count
 *   pageViews — total views, last-12-months monthly array, top pages
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getClientByClerkUserId,
  getAppBookingsCollection,
  getAppRevenueCollection,
  getAppUsersCollection,
  getAppEventsCollection,
} from "@/lib/db/client-db";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last12MonthKeys() {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const cid = client.clientId;
    const months = last12MonthKeys();

    // ── Bookings ────────────────────────────────────────────────────────────
    const bookingsCol = await getAppBookingsCollection(cid);
    const allBookings = await bookingsCol.find({}).sort({ date: 1, time: 1 }).toArray();

    const todayStr = new Date().toISOString().slice(0, 10);
    const bookingStats = {
      total:     allBookings.length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      pending:   allBookings.filter((b) => b.status === "pending").length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
      upcoming:  allBookings
        .filter((b) => b.status !== "cancelled" && b.date >= todayStr)
        .slice(0, 5),
    };

    // ── Revenue ─────────────────────────────────────────────────────────────
    const revCol = await getAppRevenueCollection(cid);
    const allRevenue = await revCol.find({ status: "succeeded" }).toArray();

    const revByMonth: Record<string, number> = {};
    for (const r of allRevenue) {
      const key = monthKey(new Date(r.createdAt));
      revByMonth[key] = (revByMonth[key] ?? 0) + r.amount;
    }

    const monthlyRevenue = months.map((k) => Math.round((revByMonth[k] ?? 0) / 100));

    // Simple MRR: active subscription amounts in the current month
    const currentMonthKey = monthKey(new Date());
    const mrr = Math.round((revByMonth[currentMonthKey] ?? 0) / 100);

    const recentTransactions = await revCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // ── Users ───────────────────────────────────────────────────────────────
    const usersCol = await getAppUsersCollection(cid);
    const userCount = await usersCol.countDocuments();

    // ── Page Views ──────────────────────────────────────────────────────────
    const eventsCol = await getAppEventsCollection(cid);

    const viewsByMonth: Record<string, number> = {};
    const pageViewcounts: Record<string, number> = {};

    const pageviewEvents = await eventsCol
      .find({ type: "pageview" })
      .project({ createdAt: 1, page: 1 })
      .toArray();

    for (const ev of pageviewEvents as { createdAt: Date; page?: string }[]) {
      const key = monthKey(new Date(ev.createdAt));
      viewsByMonth[key] = (viewsByMonth[key] ?? 0) + 1;
      if (ev.page) {
        pageViewcounts[ev.page] = (pageViewcounts[ev.page] ?? 0) + 1;
      }
    }

    const monthlyPageViews = months.map((k) => viewsByMonth[k] ?? 0);

    const topPages = Object.entries(pageViewcounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, views]) => ({ page, views }));

    return NextResponse.json({
      bookings: bookingStats,
      revenue: {
        mrr,
        arr: mrr * 12,
        total: Math.round(allRevenue.reduce((s, r) => s + r.amount, 0) / 100),
        monthly: monthlyRevenue,
        transactions: recentTransactions,
      },
      users: { total: userCount },
      pageViews: {
        total: pageviewEvents.length,
        monthly: monthlyPageViews,
        topPages,
      },
    });
  } catch (err) {
    console.error("[GET /api/me/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
