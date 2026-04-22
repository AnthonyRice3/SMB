/**
 * POST /api/v1/users
 *
 * Register or upsert an end-user into the calling client's app_users collection.
 * Called from the client's own web app whenever a user signs up or signs in.
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Body:
 *   email      — required, the end-user's email
 *   name       — required, display name
 *   clerkUserId— optional, stable Clerk user ID from the associated app
 *   avatarUrl  — optional
 *   plan       — optional, user's subscription tier inside the client's app
 *   metadata   — optional arbitrary key-value object
 *
 * Returns:
 *   { userId, isNew }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { getAppUsersCollection } from "@/lib/db/client-db";

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
  const { email, name, clerkUserId, avatarUrl, plan, metadata } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400, headers: corsHeaders });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400, headers: corsHeaders });
  }
  if (clerkUserId != null && typeof clerkUserId !== "string") {
    return NextResponse.json({ error: "clerkUserId must be a string when provided" }, { status: 400, headers: corsHeaders });
  }

  try {
    const col = await getAppUsersCollection(client.clientId);
    const now = new Date();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = (typeof clerkUserId === "string" && clerkUserId.trim())
      ? await col.findOne({ clerkUserId: clerkUserId.trim() })
      : await col.findOne({ email: normalizedEmail });

    if (existing) {
      await col.updateOne(
        { _id: existing._id },
        {
          $set: {
            email: normalizedEmail,
            name: (name as string).trim(),
            lastSeenAt: now,
            ...(clerkUserId ? { clerkUserId: clerkUserId.trim() } : {}),
            ...(avatarUrl ? { avatarUrl: avatarUrl as string } : {}),
            ...(plan ? { plan: plan as string } : {}),
            ...(metadata && typeof metadata === "object" ? { metadata: metadata as Record<string, unknown> } : {}),
          },
          $inc: { pageViews: 1, sessionCount: 1 },
        }
      );
      return NextResponse.json(
        { userId: existing._id?.toString(), isNew: false },
        { headers: corsHeaders }
      );
    }

    const result = await col.insertOne({
      email: normalizedEmail,
      name: (name as string).trim(),
      ...(clerkUserId ? { clerkUserId: clerkUserId.trim() } : {}),
      ...(avatarUrl ? { avatarUrl: avatarUrl as string } : {}),
      ...(plan ? { plan: plan as string } : {}),
      ...(metadata && typeof metadata === "object" ? { metadata: metadata as Record<string, unknown> } : {}),
      pageViews: 1,
      sessionCount: 1,
      firstSeenAt: now,
      lastSeenAt: now,
    });

    return NextResponse.json(
      { userId: result.insertedId.toString(), isNew: true },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("[POST /api/v1/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
