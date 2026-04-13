/**
 * app/api/inquiries/route.ts
 *
 * POST /api/inquiries  — public, submit a contact/demo request
 * GET  /api/inquiries  — admin-only, list all inquiries
 */

import { NextRequest, NextResponse } from "next/server";
import { getInquiriesCollection } from "@/lib/db/client-db";
import type { InquiryDoc } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, email, company, message, topic, date, time, duration } =
      body as Partial<InquiryDoc & { type: string }>;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }
    if (!["inquiry", "demo"].includes(type as string)) {
      return NextResponse.json(
        { error: "type must be inquiry or demo" },
        { status: 400 }
      );
    }

    const doc: InquiryDoc = {
      type: type as "inquiry" | "demo",
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() ?? "",
      message: message?.trim(),
      topic: topic?.trim(),
      date,
      time,
      duration: duration ? Number(duration) : undefined,
      status: "new",
      createdAt: new Date(),
    };

    const col = await getInquiriesCollection();
    await col.insertOne(doc);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/inquiries]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {

  try {
    const col = await getInquiriesCollection();
    const list = await col
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(list);
  } catch (err) {
    console.error("[GET /api/inquiries]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
