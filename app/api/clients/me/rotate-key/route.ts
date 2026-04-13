import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { getClientsCollection } from "@/lib/db/client-db";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clients = await getClientsCollection();
    const apiKey = `sgk_${randomBytes(20).toString("hex")}`;
    const result = await clients.updateOne(
      { clerkUserId: userId },
      { $set: { apiKey, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0)
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json({ apiKey });
  } catch (err) {
    console.error("[POST /api/clients/me/rotate-key]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}