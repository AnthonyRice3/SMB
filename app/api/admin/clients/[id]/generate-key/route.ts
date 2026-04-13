/**
 * POST /api/admin/clients/[id]/generate-key
 * Admin-only: generate (or regenerate) a SAGAH API key for a client.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { randomBytes } from "crypto";
import { getClientsCollection } from "@/lib/db/client-db";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const apiKey = `sgk_${randomBytes(20).toString("hex")}`;

  try {
    const clients = await getClientsCollection();
    const result = await clients.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { apiKey, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ apiKey });
  } catch (err) {
    console.error("[POST /api/admin/clients/[id]/generate-key]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
