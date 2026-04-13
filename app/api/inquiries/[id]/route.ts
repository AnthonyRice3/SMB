import { NextRequest, NextResponse } from "next/server";
import { getInquiriesCollection } from "@/lib/db/client-db";
import { ObjectId } from "mongodb";
import type { InquiryStatus } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status } = body as { status?: InquiryStatus };

    if (!status || !["new", "read", "replied"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const col = await getInquiriesCollection();
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/inquiries/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
