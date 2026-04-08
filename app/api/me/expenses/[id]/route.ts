/**
 * PATCH  /api/me/expenses/[id]  — update an expense
 * DELETE /api/me/expenses/[id]  — delete an expense
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { getClientByClerkUserId, getAppExpensesCollection } from "@/lib/db/client-db";
import type { AppExpenseDoc } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const body = await req.json() as Partial<AppExpenseDoc>;
    const allowed: (keyof AppExpenseDoc)[] = ["amount", "category", "description", "vendor", "date", "recurrence", "taxDeductible", "notes"];
    const update: Partial<AppExpenseDoc> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in body) (update as Record<string, unknown>)[key] = body[key];
    }

    const col = await getAppExpensesCollection(client.clientId);
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[PATCH /api/me/expenses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const col = await getAppExpensesCollection(client.clientId);
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/me/expenses/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
