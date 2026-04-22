/**
 * POST /api/v1/bookings
 *
 * Create a booking in the calling client's app_bookings collection.
 * Checks for conflicts against existing confirmed/pending bookings before inserting.
 * Returns 409 if the requested time slot is already taken.
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Body:
 *   name     — required, customer name
 *   email    — required, customer email
 *   service  — required, service being booked
 *   date     — required, ISO date YYYY-MM-DD
 *   time     — required, 24h "HH:MM" or 12h "H:MM AM/PM"
 *   duration — optional, minutes (default 60)
 *   notes    — optional
 *   userId   — optional, SAGAH end-user _id
 *
 * Returns: { bookingId }
 *
 * GET /api/v1/bookings
 *
 * Fetch bookings for a specific end-user (their own).
 *
 * Query params:
 *   userEmail — required, the end-user's email
 *   status    — optional, filter by status (confirmed|pending|cancelled)
 *
 * Returns: { bookings: AppBookingDoc[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { getAppBookingsCollection } from "@/lib/db/client-db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/** Parse "2:00 PM" / "14:00" → total minutes from midnight, or null */
function timeToMinutes(t: string): number | null {
  t = t.trim();
  const h24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hh = parseInt(h24[1], 10);
    const mm = parseInt(h24[2], 10);
    if (hh < 24 && mm < 60) return hh * 60 + mm;
  }
  const h12 = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (h12) {
    let hh = parseInt(h12[1], 10);
    const mm = parseInt(h12[2], 10);
    const period = h12[3].toUpperCase();
    if (period === "AM" && hh === 12) hh = 0;
    if (period === "PM" && hh !== 12) hh += 12;
    if (hh < 24 && mm < 60) return hh * 60 + mm;
  }
  return null;
}

function minutesToHHMM(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── GET: end-user reads their own bookings ───────────────────────────────────
export async function GET(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  const userEmail = req.nextUrl.searchParams.get("userEmail");
  if (!userEmail) {
    return NextResponse.json({ error: "userEmail query param is required" }, { status: 400, headers: corsHeaders });
  }

  const statusFilter = req.nextUrl.searchParams.get("status");
  const validStatuses = ["confirmed", "pending", "cancelled"];

  try {
    const col = await getAppBookingsCollection(client.clientId);
    const query: Record<string, unknown> = { email: userEmail.toLowerCase().trim() };
    if (statusFilter && validStatuses.includes(statusFilter)) {
      query.status = statusFilter;
    }

    const bookings = await col
      .find(query)
      .sort({ date: 1, time: 1 })
      .toArray();

    return NextResponse.json({ bookings }, { headers: corsHeaders });
  } catch (err) {
    console.error("[GET /api/v1/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

// ── POST: create a booking with conflict check ───────────────────────────────
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

  const requestedMins = timeToMinutes(String(time));
  if (requestedMins === null) {
    return NextResponse.json(
      { error: 'time must be "HH:MM" (24h) or "H:MM AM/PM" (12h)' },
      { status: 400, headers: corsHeaders }
    );
  }
  const requestedDuration = typeof duration === "number" && duration > 0 ? duration : 60;
  const requestedEnd = requestedMins + requestedDuration;
  const requestedHHMM = minutesToHHMM(requestedMins);

  try {
    const col = await getAppBookingsCollection(client.clientId);

    const blockedDates = client.calendarSettings?.blockedDates ?? [];
    const blockedSlots = client.calendarSettings?.blockedSlots ?? [];

    if (blockedDates.includes(dateStr)) {
      return NextResponse.json(
        { error: "Selected date is blocked", blocked: true },
        { status: 409, headers: corsHeaders }
      );
    }

    if (blockedSlots.includes(`${dateStr}T${requestedHHMM}`)) {
      return NextResponse.json(
        { error: "Selected time slot is blocked", blocked: true },
        { status: 409, headers: corsHeaders }
      );
    }

    // ── Conflict check ──────────────────────────────────────────────────────
    const sameDay = await col
      .find({ date: dateStr, status: { $in: ["confirmed", "pending"] } })
      .toArray();

    for (const existing of sameDay) {
      const existingMins = timeToMinutes(existing.time);
      if (existingMins === null) continue;
      const existingEnd = existingMins + (existing.duration ?? 60);
      // Overlap if: requested starts before existing ends AND ends after existing starts
      if (requestedMins < existingEnd && requestedEnd > existingMins) {
        return NextResponse.json(
          { error: "Time slot is already booked", conflict: true },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    const now = new Date();
    const result = await col.insertOne({
      name:     String(name).trim(),
      email:    String(email).toLowerCase().trim(),
      service:  String(service).trim(),
      date:     dateStr,
      time:     String(time),
      duration: requestedDuration,
      status:   "confirmed",
      ...(notes  ? { notes:  String(notes)  } : {}),
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

