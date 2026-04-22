/**
 * app/api/admin/tickets/[id]/route.ts
 *
 * PATCH /api/admin/tickets/[id] — admin-only, add an admin reply + optionally update status
 *   Body: { message?: string, status?: TicketStatus }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import { getTicketsCollection } from "@/lib/db/client-db";
import type { TicketMessageDoc, TicketStatus } from "@/lib/db/schema";

async function requireAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { message?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validStatuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
  const col = await getTicketsCollection();
  const filter = { _id: new ObjectId(id) };

  if (body.message && typeof body.message === "string" && body.message.trim()) {
    const newMsg: TicketMessageDoc = {
      id: randomUUID(),
      from: "admin",
      text: body.message.trim(),
      createdAt: new Date(),
    };

    const newStatus: TicketStatus =
      body.status && validStatuses.includes(body.status as TicketStatus)
        ? (body.status as TicketStatus)
        : "in_progress";

    const result = await col.updateOne(filter, {
      $push: { messages: newMsg } as never,
      $set:  { status: newStatus, updatedAt: new Date() },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, messageId: newMsg.id });
  }

  // Status-only update
  if (!body.status || !validStatuses.includes(body.status as TicketStatus)) {
    return NextResponse.json(
      { error: "status must be one of: open, in_progress, resolved, closed" },
      { status: 400 }
    );
  }

  const result = await col.updateOne(filter, {
    $set: { status: body.status as TicketStatus, updatedAt: new Date() },
  });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
