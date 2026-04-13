/**
 * app/api/clients/[id]/route.ts
 *
 * GET  /api/clients/[id]  — fetch a single client by MongoDB _id (admin only)
 * PATCH /api/clients/[id] — update plan / status / pipelineStage (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientsCollection } from "@/lib/db/client-db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const clients = await getClientsCollection();
    const client = await clients.findOne({ _id: new ObjectId(id) });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(client);
  } catch (err) {
    console.error("[GET /api/clients/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json() as Record<string, unknown>;

  const allowed = ["plan", "status", "pipelineStage"] as const;
  const update: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  update.updatedAt = new Date();

  try {
    const clients = await getClientsCollection();
    const result = await clients.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/clients/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
