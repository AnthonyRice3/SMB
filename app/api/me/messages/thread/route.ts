/**
 * GET  /api/me/messages/thread?userEmail=xxx
 *   Returns the full message thread for one end-user.
 *   Also marks all user→client messages as read.
 *
 * POST /api/me/messages/thread
 *   Client sends a reply to an end-user.
 *   Body: { userEmail, userName, text, userId? }
 *   Returns: { messageId }
 *
 * Auth: Clerk (authenticated client dashboard user)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientByClerkUserId, getAppMessagesCollection } from "@/lib/db/client-db";
import type { AppMessageDoc } from "@/lib/db/schema";

// ── GET: load thread + mark as read ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = req.nextUrl.searchParams.get("userEmail");
  if (!userEmail) {
    return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const col = await getAppMessagesCollection(client.clientId);
    const messages = await col
      .find({ userEmail: userEmail.toLowerCase().trim() })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark all user→client messages as read (client is reading them)
    await col.updateMany(
      { userEmail: userEmail.toLowerCase().trim(), from: "user", read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[GET /api/me/messages/thread]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: client sends a reply ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const { userEmail, userName, text, userId: endUserId } = body;

  if (!userEmail || typeof userEmail !== "string") {
    return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const col = await getAppMessagesCollection(client.clientId);

    const doc: AppMessageDoc = {
      userEmail: (userEmail as string).toLowerCase().trim(),
      userName:  typeof userName === "string" ? userName.trim() : "User",
      ...(endUserId ? { userId: String(endUserId) } : {}),
      from: "client",
      text: (text as string).trim(),
      read: false,
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc as never);
    return NextResponse.json({ messageId: result.insertedId });
  } catch (err) {
    console.error("[POST /api/me/messages/thread]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
