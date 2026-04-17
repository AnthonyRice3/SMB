import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getConsultationsCollection } from "@/lib/db/client-db";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

// GET /api/admin/consultations — list all consultations sorted newest first
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const col = await getConsultationsCollection();
  const consultations = await col
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(
    consultations.map((c) => ({
      id:       c._id!.toString(),
      name:     c.name,
      email:    c.email,
      company:  c.company ?? "",
      date:     c.date,
      time:     c.time,
      topic:    c.topic,
      notes:    c.notes ?? "",
      duration: c.duration,
      status:   c.status,
    }))
  );
}

// POST /api/admin/consultations — create a new consultation
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    name?: string;
    email?: string;
    company?: string;
    date?: string;
    time?: string;
    topic?: string;
    notes?: string;
    duration?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, date, time, topic, company, notes, duration } = body;

  if (!name || !email || !date || !time || !topic) {
    return NextResponse.json(
      { error: "name, email, date, time and topic are required" },
      { status: 400 }
    );
  }

  const col = await getConsultationsCollection();
  const result = await col.insertOne({
    name,
    email,
    company:   company ?? "",
    date,
    time,
    topic,
    notes:     notes ?? "",
    duration:  typeof duration === "number" ? duration : 30,
    status:    "scheduled",
    createdAt: new Date(),
  });

  return NextResponse.json(
    {
      id:       result.insertedId.toString(),
      name,
      email,
      company:  company ?? "",
      date,
      time,
      topic,
      notes:    notes ?? "",
      duration: typeof duration === "number" ? duration : 30,
      status:   "scheduled",
    },
    { status: 201 }
  );
}
