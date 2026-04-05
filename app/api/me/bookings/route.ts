/**
 * app/api/me/bookings/route.ts
 *
 * GET  /api/me/bookings  — list all bookings for the current client
 * POST /api/me/bookings  — create a new booking
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getClientByClerkUserId,
  getAppBookingsCollection,
} from "@/lib/db/client-db";
import type { AppBookingDoc } from "@/lib/db/schema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const col = await getAppBookingsCollection(client.clientId);
    const bookings = await col.find({}).sort({ date: 1, time: 1 }).toArray();

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("[GET /api/me/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, service, date, time, duration, notes } = body as Partial<AppBookingDoc>;

    if (!name?.trim() || !email?.trim() || !service?.trim() || !date || !time) {
      return NextResponse.json(
        { error: "name, email, service, date, and time are required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const doc: AppBookingDoc = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      service: service.trim(),
      date,
      time,
      duration: duration ? Number(duration) : 30,
      status: "confirmed",
      notes: notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const col = await getAppBookingsCollection(client.clientId);
    const result = await col.insertOne(doc);

    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/me/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
