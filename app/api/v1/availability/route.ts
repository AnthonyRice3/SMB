/**
 * GET /api/v1/availability
 *
 * Returns available time slots for a given date, accounting for:
 *   - The business owner's configured working hours
 *   - Already-booked confirmed/pending slots
 *   - Manually blocked dates and slots from the dashboard
 *
 * Query params:
 *   date     — required, YYYY-MM-DD
 *   duration — optional, minutes (overrides client's slotDuration default)
 *
 * Auth: Bearer sgk_<key>
 *
 * Response:
 *   {
 *     date:       "2026-04-22",
 *     slotDuration: 60,
 *     available:  ["09:00", "10:00", "11:00"],   // HH:MM 24h
 *     booked:     ["13:00"],
 *     blocked:    ["12:00"],
 *     isFullDayBlocked: false,
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { getAppBookingsCollection, getClientsCollection } from "@/lib/db/client-db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/** Parse "2:00 PM" / "14:00" / "2:00PM" → "14:00" */
function normalizeTime(t: string): string | null {
  t = t.trim();
  // Already 24h: "14:00" or "09:00"
  const h24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hh = parseInt(h24[1], 10);
    const mm = parseInt(h24[2], 10);
    if (hh < 24 && mm < 60) return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  // 12h with AM/PM: "2:00 PM", "9:00 AM", "12:00 PM"
  const h12 = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (h12) {
    let hh = parseInt(h12[1], 10);
    const mm = parseInt(h12[2], 10);
    const period = h12[3].toUpperCase();
    if (period === "AM" && hh === 12) hh = 0;
    if (period === "PM" && hh !== 12) hh += 12;
    if (hh < 24 && mm < 60) return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return null;
}

/** "09:00" → total minutes from midnight */
function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** total minutes → "09:00" */
function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400, headers: corsHeaders });
  }

  try {
    // Refresh client doc to get calendarSettings
    const clientsCol = await getClientsCollection();
    const clientDoc = await clientsCol.findOne({ clientId: client.clientId });
    const settings = clientDoc?.calendarSettings;

    const slotDuration =
      parseInt(req.nextUrl.searchParams.get("duration") ?? "0") ||
      (settings?.slotDuration ?? 60);
    const bufferMinutes = settings?.bufferMinutes ?? 0;

    // ── Full-day blocked? ───────────────────────────────────────────────────
    const isFullDayBlocked = settings?.blockedDates?.includes(date) ?? false;
    if (isFullDayBlocked) {
      return NextResponse.json({
        date,
        slotDuration,
        available: [],
        booked: [],
        blocked: [],
        isFullDayBlocked: true,
      }, { headers: corsHeaders });
    }

    // ── Working hours for this day of week ─────────────────────────────────
    const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay() as 0|1|2|3|4|5|6;
    const dayHours = settings?.workingHours?.filter((w) => w.day === dayOfWeek) ?? [];

    // Default to 9 AM – 5 PM Mon-Fri if no settings configured
    let ranges: Array<{ start: string; end: string }>;
    if (dayHours.length > 0) {
      ranges = dayHours;
    } else {
      // Mon–Fri default; weekend = no slots if no settings
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        ranges = [];
      } else {
        ranges = [{ start: "09:00", end: "17:00" }];
      }
    }

    // Generate all slots from working hour ranges
    const allSlots: string[] = [];
    for (const range of ranges) {
      let cursor = toMinutes(range.start);
      const end   = toMinutes(range.end);
      while (cursor + slotDuration <= end) {
        allSlots.push(fromMinutes(cursor));
        cursor += slotDuration;
      }
    }

    if (allSlots.length === 0) {
      return NextResponse.json({
        date,
        slotDuration,
        available: [],
        booked: [],
        blocked: [],
        isFullDayBlocked: false,
      }, { headers: corsHeaders });
    }

    // ── Booked slots for this date ─────────────────────────────────────────
    const bookingsCol = await getAppBookingsCollection(client.clientId);
    const existingBookings = await bookingsCol
      .find({ date, status: { $in: ["confirmed", "pending"] } })
      .toArray();

    const bookedSet = new Set<string>();
    for (const b of existingBookings) {
      const normalized = normalizeTime(b.time);
      if (!normalized) continue;
      const slotStart   = toMinutes(normalized);
      const slotEnd     = slotStart + (b.duration ?? slotDuration) + bufferMinutes;
      // Mark all overlapping generated slots as booked
      for (const slot of allSlots) {
        const s = toMinutes(slot);
        const e = s + slotDuration;
        if (s < slotEnd && e > slotStart) {
          bookedSet.add(slot);
        }
      }
    }

    // ── Manually blocked slots ─────────────────────────────────────────────
    const blockedPrefixes = (settings?.blockedSlots ?? [])
      .filter((s) => s.startsWith(date))
      .map((s) => s.slice(11)); // "YYYY-MM-DDTHH:MM" → "HH:MM"

    const blockedSet = new Set<string>(
      allSlots.filter((slot) => blockedPrefixes.includes(slot))
    );

    // ── Build response ────────────────────────────────────────────────────
    const available = allSlots.filter((s) => !bookedSet.has(s) && !blockedSet.has(s));
    const booked    = allSlots.filter((s) => bookedSet.has(s));
    const blocked   = allSlots.filter((s) => blockedSet.has(s) && !bookedSet.has(s));

    return NextResponse.json({
      date,
      slotDuration,
      available,
      booked,
      blocked,
      isFullDayBlocked: false,
    }, { headers: corsHeaders });

  } catch (err) {
    console.error("[GET /api/v1/availability]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
