/**
 * POST /api/v1/events
 *
 * Track an analytics event from the calling client's app.
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Body:
 *   type      — required, event name (e.g. "page_view", "button_click")
 *   userId    — optional, end-user's MongoDB _id from /api/v1/users
 *   properties— optional, arbitrary key-value object
 *
 * Returns: { ok: true, eventId }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { getAppEventsCollection } from "@/lib/db/client-db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { type, userId, properties } = body as Record<string, unknown>;

  if (typeof type !== "string" || !type.trim()) {
    return NextResponse.json({ error: "type is required" }, { status: 400, headers: corsHeaders });
  }

  try {
    const col = await getAppEventsCollection(client.clientId);
    const result = await col.insertOne({
      type: (type as string).trim(),
      ...(userId ? { userId: userId as string } : {}),
      ...(properties && typeof properties === "object" ? { properties: properties as Record<string, unknown> } : {}),
      createdAt: new Date(),
    } as never);

    return NextResponse.json(
      { ok: true, eventId: result.insertedId.toString() },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("[POST /api/v1/events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
