/**
 * app/api/me/bookings/[id]/route.ts
 *
 * PATCH /api/me/bookings/:id  — update booking status
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getClientByClerkUserId,
  getAppBookingsCollection,
} from "@/lib/db/client-db";
import { ObjectId } from "mongodb";
import type { BookingStatus } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status } = body as { status?: BookingStatus };

    if (!status || !["confirmed", "pending", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const col = await getAppBookingsCollection(client.clientId);
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/me/bookings/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
