/**
 * GET  /api/me/expenses  — list expenses for the authenticated client
 * POST /api/me/expenses  — create a new expense
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientByClerkUserId, getAppExpensesCollection } from "@/lib/db/client-db";
import type { AppExpenseDoc } from "@/lib/db/schema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const col = await getAppExpensesCollection(client.clientId);
    const expenses = await col.find({}).sort({ date: -1, createdAt: -1 }).toArray();
    return NextResponse.json(expenses);
  } catch (err) {
    console.error("[GET /api/me/expenses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const body = await req.json() as Partial<AppExpenseDoc>;
    const { amount, category, description, vendor, date, recurrence, taxDeductible, notes } = body;

    if (!amount || amount <= 0)     return NextResponse.json({ error: "amount must be > 0" }, { status: 400 });
    if (!category)                  return NextResponse.json({ error: "category is required" }, { status: 400 });
    if (!description?.trim())       return NextResponse.json({ error: "description is required" }, { status: 400 });
    if (!date)                      return NextResponse.json({ error: "date is required" }, { status: 400 });

    const now = new Date();
    const col = await getAppExpensesCollection(client.clientId);

    const doc: AppExpenseDoc = {
      amount,
      category,
      description: description.trim(),
      vendor: vendor?.trim() || undefined,
      date,
      recurrence: recurrence ?? "one_time",
      taxDeductible: taxDeductible ?? false,
      notes: notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc);
    return NextResponse.json({ _id: result.insertedId, ...doc }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/me/expenses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
