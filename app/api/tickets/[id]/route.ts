/**
 * app/api/tickets/[id]/route.ts
 *
 * PATCH /api/tickets/[id] — add a user message to an existing ticket
 *   Body: { message: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import { getTicketsCollection, getClientByClerkUserId } from "@/lib/db/client-db";
import type { TicketMessageDoc } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getClientByClerkUserId(userId);
  if (!client) return NextResponse.json({ error: "No client account found" }, { status: 404 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const newMsg: TicketMessageDoc = {
    id: randomUUID(),
    from: "user",
    text: body.message.trim(),
    createdAt: new Date(),
  };

  try {
    const col = await getTicketsCollection();
    const result = await col.updateOne(
      { _id: new ObjectId(id), clientId: client.clientId },
      {
        $push: { messages: newMsg } as never,
        $set:  { updatedAt: new Date(), status: "open" },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, messageId: newMsg.id });
  } catch (err) {
    console.error("[PATCH /api/tickets/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
