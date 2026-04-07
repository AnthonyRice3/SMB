/**
 * POST /api/v1/bookings
 *
 * Create a booking in the calling client's app_bookings collection.
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Body:
 *   name     — required, customer name
 *   email    — required, customer email
 *   service  — required, service being booked
 *   date     — required, ISO date YYYY-MM-DD
 *   time     — required, human-readable time e.g. "2:00 PM"
 *   duration — optional, minutes (default 60)
 *   notes    — optional
 *   userId   — optional, SAGAH end-user _id
 *
 * Returns: { bookingId }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { getAppBookingsCollection } from "@/lib/db/client-db";

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
  const { name, email, service, date, time, duration = 60, notes, userId } = body as Record<string, unknown>;

  if (!name || !email || !service || !date || !time) {
    return NextResponse.json(
      { error: "name, email, service, date, and time are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const dateStr = String(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400, headers: corsHeaders });
  }

  try {
    const col = await getAppBookingsCollection(client.clientId);
    const now = new Date();
    const result = await col.insertOne({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      service: String(service).trim(),
      date: dateStr,
      time: String(time),
      duration: typeof duration === "number" ? duration : 60,
      status: "confirmed",
      ...(notes ? { notes: String(notes) } : {}),
      ...(userId ? { userId: String(userId) } : {}),
      createdAt: now,
      updatedAt: now,
    } as never);

    return NextResponse.json(
      { bookingId: result.insertedId.toString() },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("[POST /api/v1/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
