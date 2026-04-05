/**
 * app/api/admin/stats/route.ts
 *
 * GET /api/admin/stats  — admin-only, platform-wide overview stats
 *
 * Returns total clients, plan breakdown, status breakdown, MRR from clients
 * collection, and recent activity (latest N clients).
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientsCollection, getAppRevenueCollection } from "@/lib/db/client-db";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

  if (!userId || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const clientsCol = await getClientsCollection();
    const clients = await clientsCol.find({}).sort({ createdAt: -1 }).toArray();

    const total = clients.length;

    // Plan breakdown
    const planCounts: Record<string, number> = {};
    for (const c of clients) {
      planCounts[c.plan] = (planCounts[c.plan] ?? 0) + 1;
    }

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const c of clients) {
      statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;
    }

    // Aggregate MRR across all clients' app_revenue collections
    const PLAN_PRICE: Record<string, number> = {
      Free:       0,
      Starter:    49,
      Pro:        299,
      Enterprise: 899,
    };
    let mrr = 0;
    for (const c of clients) {
      if (c.status === "active") {
        mrr += PLAN_PRICE[c.plan] ?? 0;
      }
    }

    // Monthly revenue (last 6 months) using plan price × active clients as proxy
    // For accurate per-client revenue, aggregate each client's app_revenue — expensive at scale
    // Here we use a lightweight estimate from the plan pricing above
    const monthlyRevenue: { month: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      monthlyRevenue.push({ month: label, value: mrr });
    }

    // Recent clients (latest 10) as "activity"
    const recentClients = clients.slice(0, 10).map((c) => ({
      name:      c.name,
      email:     c.email,
      plan:      c.plan,
      status:    c.status,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      total,
      planCounts,
      statusCounts,
      mrr,
      arr: mrr * 12,
      monthlyRevenue,
      recentClients,
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
