import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientByClerkUserId, getAppUsersCollection } from "@/lib/db/client-db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const col = await getAppUsersCollection(client.clientId);
    const users = await col.find({}).sort({ lastSeenAt: -1 }).toArray();
    return NextResponse.json(users);
  } catch (err) {
    console.error("[GET /api/me/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}