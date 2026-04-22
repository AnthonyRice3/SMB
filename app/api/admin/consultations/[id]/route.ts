import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getConsultationsCollection } from "@/lib/db/client-db";
import { ObjectId } from "mongodb";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

// PATCH /api/admin/consultations/[id] — update status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status } = body;
  const allowed = ["scheduled", "completed", "cancelled"];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: scheduled, completed, cancelled" },
      { status: 400 }
    );
  }

  const col = await getConsultationsCollection();
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: status as "scheduled" | "completed" | "cancelled" } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status });
}
