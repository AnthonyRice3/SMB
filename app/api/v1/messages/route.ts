/**
 * /api/v1/messages
 *
 * POST — End-user sends a message to the client (business owner).
 *   Headers: Authorization: Bearer sgk_<key>
 *   Body: { userEmail, userName, text, userId? }
 *   Returns: { messageId }
 *
 * GET  — End-user fetches their message thread with the client.
 *   Headers: Authorization: Bearer sgk_<key>
 *   Query:  ?userEmail=xxx   (required)
 *   Returns: { messages: AppMessageDoc[] }
 *   Also marks all client→user messages as read (so client sees delivery)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { getAppMessagesCollection } from "@/lib/db/client-db";
import type { AppMessageDoc } from "@/lib/db/schema";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ── POST: end-user sends a message ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const { userEmail, userName, text, userId } = body;

  if (!userEmail || typeof userEmail !== "string") {
    return NextResponse.json({ error: "userEmail is required" }, { status: 400, headers: corsHeaders });
  }
  if (!userName || typeof userName !== "string") {
    return NextResponse.json({ error: "userName is required" }, { status: 400, headers: corsHeaders });
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400, headers: corsHeaders });
  }

  try {
    const col = await getAppMessagesCollection(client.clientId);

    const doc: AppMessageDoc = {
      userEmail: userEmail.toLowerCase().trim(),
      userName: String(userName).trim(),
      ...(userId ? { userId: String(userId) } : {}),
      from: "user",
      text: text.trim(),
      read: false,
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc as never);
    return NextResponse.json({ messageId: result.insertedId }, { headers: corsHeaders });
  } catch (err) {
    console.error("[POST /api/v1/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

// ── GET: end-user reads their thread ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  const userEmail = req.nextUrl.searchParams.get("userEmail");
  if (!userEmail) {
    return NextResponse.json({ error: "userEmail query param is required" }, { status: 400, headers: corsHeaders });
  }

  try {
    const col = await getAppMessagesCollection(client.clientId);
    const messages = await col
      .find({ userEmail: userEmail.toLowerCase().trim() })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark all client→user messages as read (end-user is reading them)
    await col.updateMany(
      { userEmail: userEmail.toLowerCase().trim(), from: "client", read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ messages }, { headers: corsHeaders });
  } catch (err) {
    console.error("[GET /api/v1/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
