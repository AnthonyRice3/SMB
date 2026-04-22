/**
 * GET  /api/me/messages/thread?userEmail=xxx
 *   Returns the full message thread for one end-user.
 *   Also marks all user→client messages as read.
 *
 * POST /api/me/messages/thread
 *   Client sends a reply to an end-user.
 *   Body: { userEmail, userName, text, userId? }
 *   Returns: { messageId }
 *
 * Auth: Clerk (authenticated client dashboard user)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getClientByClerkUserId,
  getAppMessagesCollection,
  getAppBookingsCollection,
  getAppRevenueCollection,
} from "@/lib/db/client-db";
import type { AppMessageDoc } from "@/lib/db/schema";

function parseBookingDateTime(date: string, time: string): Date | null {
  const dayMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dayMatch) return null;

  const h24 = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hour = Number(h24[1]);
    const minute = Number(h24[2]);
    if (hour < 24 && minute < 60) {
      return new Date(Number(dayMatch[1]), Number(dayMatch[2]) - 1, Number(dayMatch[3]), hour, minute);
    }
  }

  const h12 = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (h12) {
    let hour = Number(h12[1]);
    const minute = Number(h12[2]);
    const period = h12[3].toUpperCase();
    if (period === "AM" && hour === 12) hour = 0;
    if (period === "PM" && hour !== 12) hour += 12;
    return new Date(Number(dayMatch[1]), Number(dayMatch[2]) - 1, Number(dayMatch[3]), hour, minute);
  }

  return null;
}

// ── GET: load thread + mark as read ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userEmail = req.nextUrl.searchParams.get("userEmail");
  const endUserId = req.nextUrl.searchParams.get("userId");
  if (!userEmail) {
    return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const [msgCol, bookingCol, revenueCol] = await Promise.all([
      getAppMessagesCollection(client.clientId),
      getAppBookingsCollection(client.clientId),
      getAppRevenueCollection(client.clientId),
    ]);

    const normalizedEmail = userEmail.toLowerCase().trim();
    const [messages, bookings, purchases] = await Promise.all([
      msgCol.find({ userEmail: normalizedEmail }).sort({ createdAt: 1 }).toArray(),
      bookingCol.find({ email: normalizedEmail }).sort({ date: 1, time: 1 }).toArray(),
      endUserId ? revenueCol.find({ userId: endUserId }).sort({ createdAt: -1 }).toArray() : Promise.resolve([]),
    ]);

    const now = new Date();
    const past: Array<Record<string, unknown>> = [];
    const present: Array<Record<string, unknown>> = [];
    const future: Array<Record<string, unknown>> = [];

    for (const b of bookings) {
      const start = parseBookingDateTime(b.date, b.time);
      const end = start ? new Date(start.getTime() + (b.duration ?? 60) * 60000) : null;
      const bookingItem = {
        type: "service",
        source: "booking",
        id: String(b._id),
        title: b.service,
        subtitle: `${b.date} ${b.time}`,
        status: b.status,
        date: b.date,
        time: b.time,
        duration: b.duration,
      };

      if (b.status === "cancelled") {
        past.push(bookingItem);
        continue;
      }

      if (start && end) {
        if (now < start) future.push(bookingItem);
        else if (now > end) past.push(bookingItem);
        else present.push(bookingItem);
      } else {
        past.push(bookingItem);
      }
    }

    for (const p of purchases) {
      const purchaseItem = {
        type: "product",
        source: "purchase",
        id: String(p._id),
        title: p.plan ?? (p.type === "subscription" ? "Subscription" : "One-time purchase"),
        subtitle: `${(p.amount / 100).toFixed(2)} ${p.currency.toUpperCase()}`,
        status: p.status,
        createdAt: p.createdAt,
        amount: p.amount,
        currency: p.currency,
      };

      if (p.status === "pending") present.push(purchaseItem);
      else past.push(purchaseItem);
    }

    // Mark all user→client messages as read (client is reading them)
    await msgCol.updateMany(
      { userEmail: normalizedEmail, from: "user", read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({
      messages,
      activity: {
        past,
        present,
        future,
      },
    });
  } catch (err) {
    console.error("[GET /api/me/messages/thread]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: client sends a reply ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const { userEmail, userName, text, userId: endUserId } = body;

  if (!userEmail || typeof userEmail !== "string") {
    return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const col = await getAppMessagesCollection(client.clientId);

    const doc: AppMessageDoc = {
      userEmail: (userEmail as string).toLowerCase().trim(),
      userName:  typeof userName === "string" ? userName.trim() : "User",
      ...(endUserId ? { userId: String(endUserId) } : {}),
      from: "client",
      text: (text as string).trim(),
      read: false,
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc as never);
    return NextResponse.json({ messageId: result.insertedId });
  } catch (err) {
    console.error("[POST /api/me/messages/thread]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
