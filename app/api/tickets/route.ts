/**
 * app/api/tickets/route.ts
 *
 * Dashboard-authenticated routes for SAGAH clients to manage their support tickets.
 *
 * GET  /api/tickets        — list all tickets for the logged-in client
 * POST /api/tickets        — create a new support ticket
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { getTicketsCollection, getClientByClerkUserId } from "@/lib/db/client-db";
import type { TicketDoc, TicketCategory, TicketPriority } from "@/lib/db/schema";

async function getClient(userId: string) {
  return getClientByClerkUserId(userId);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getClient(userId);
  if (!client) return NextResponse.json({ error: "No client account found" }, { status: 404 });

  try {
    const col = await getTicketsCollection();
    const tickets = await col
      .find({ clientId: client.clientId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(tickets);
  } catch (err) {
    console.error("[GET /api/tickets]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const client = await getClient(userId);
  if (!client) return NextResponse.json({ error: "No client account found" }, { status: 404 });

  let body: { subject?: string; category?: string; priority?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subject, category, priority, message } = body;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const validCategories: TicketCategory[] = ["general", "billing", "technical", "feature", "urgent"];
  const validPriorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

  const now = new Date();
  const doc: TicketDoc = {
    clientId: client.clientId,
    subject: subject.trim(),
    category: (validCategories.includes(category as TicketCategory) ? category : "general") as TicketCategory,
    priority: (validPriorities.includes(priority as TicketPriority) ? priority : "medium") as TicketPriority,
    status: "open",
    messages: [
      {
        id: randomUUID(),
        from: "user",
        text: message.trim(),
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Attach sender name for display
  const senderName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || client.name;
  (doc as TicketDoc & { senderName?: string }).senderName = senderName;

  try {
    const col = await getTicketsCollection();
    const result = await col.insertOne(doc as never);
    return NextResponse.json({ ticketId: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tickets]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
