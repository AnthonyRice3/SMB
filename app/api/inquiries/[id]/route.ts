import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getInquiriesCollection } from "@/lib/db/client-db";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import type { InquiryStatus, InquiryReply } from "@/lib/db/schema";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json() as { status?: InquiryStatus; reply?: string };
    const col = await getInquiriesCollection();
    const filter = { _id: new ObjectId(id) };

    // Adding a reply takes priority — sets status to "replied" automatically
    if (body.reply && typeof body.reply === "string" && body.reply.trim()) {
      const newReply: InquiryReply = {
        id: randomUUID(),
        text: body.reply.trim(),
        createdAt: new Date(),
      };

      const result = await col.updateOne(filter, {
        $push: { replies: newReply } as never,
        $set:  { status: "replied" as InquiryStatus },
      });

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, replyId: newReply.id });
    }

    // Status-only update
    if (!body.status || !["new", "read", "replied"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await col.updateOne(filter, { $set: { status: body.status } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/inquiries/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
