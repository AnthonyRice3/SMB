/**
 * GET  /api/me/calendar/settings  — read the client's calendar/availability settings
 * PATCH /api/me/calendar/settings — update the client's calendar/availability settings
 *
 * Auth: Clerk (authenticated client dashboard user)
 *
 * The calendarSettings object is stored directly on the ClientDoc.
 * Shape:
 *   {
 *     slotDuration:    number;    // minutes per slot (default 60)
 *     bufferMinutes:   number;    // gap between bookings (default 0)
 *     workingHours: [{ day: 0-6, start: "HH:MM", end: "HH:MM" }];
 *     blockedDates:    string[];  // ["YYYY-MM-DD"]
 *     blockedSlots:    string[];  // ["YYYY-MM-DDTHH:MM"]
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientByClerkUserId, getClientsCollection } from "@/lib/db/client-db";

const DEFAULT_SETTINGS = {
  slotDuration:  60,
  bufferMinutes: 0,
  workingHours: [
    { day: 1, start: "09:00", end: "17:00" },
    { day: 2, start: "09:00", end: "17:00" },
    { day: 3, start: "09:00", end: "17:00" },
    { day: 4, start: "09:00", end: "17:00" },
    { day: 5, start: "09:00", end: "17:00" },
  ],
  blockedDates: [] as string[],
  blockedSlots: [] as string[],
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    return NextResponse.json({
      settings: client.calendarSettings ?? DEFAULT_SETTINGS,
    });
  } catch (err) {
    console.error("[GET /api/me/calendar/settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const current = client.calendarSettings ?? DEFAULT_SETTINGS;

    // Merge patch — only overwrite fields that are present in the request body
    const updated = {
      slotDuration:
        typeof body.slotDuration === "number" && body.slotDuration > 0
          ? body.slotDuration
          : current.slotDuration,
      bufferMinutes:
        typeof body.bufferMinutes === "number" && body.bufferMinutes >= 0
          ? body.bufferMinutes
          : current.bufferMinutes,
      workingHours:
        Array.isArray(body.workingHours) ? body.workingHours : current.workingHours,
      blockedDates:
        Array.isArray(body.blockedDates) ? body.blockedDates : current.blockedDates,
      blockedSlots:
        Array.isArray(body.blockedSlots) ? body.blockedSlots : current.blockedSlots,
    };

    const col = await getClientsCollection();
    await col.updateOne(
      { clientId: client.clientId },
      { $set: { calendarSettings: updated, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, settings: updated });
  } catch (err) {
    console.error("[PATCH /api/me/calendar/settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
