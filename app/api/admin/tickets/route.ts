/**
 * app/api/admin/tickets/route.ts
 *
 * GET /api/admin/tickets — admin-only, list all support tickets
 */

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getTicketsCollection } from "@/lib/db/client-db";

async function requireAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const col = await getTicketsCollection();
    const tickets = await col
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(tickets);
  } catch (err) {
    console.error("[GET /api/admin/tickets]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
