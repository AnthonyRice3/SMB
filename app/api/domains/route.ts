import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientsCollection, getClientByClerkUserId } from "@/lib/db/client-db";

// GET  /api/domains — return the authenticated client's domain requests
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getClientByClerkUserId(userId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  return NextResponse.json({ domains: client.domains ?? [] });
}

// POST /api/domains — submit a new domain request
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getClientByClerkUserId(userId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  let body: { domain?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body.domain ?? "").trim().toLowerCase();
  if (!raw) return NextResponse.json({ error: "Domain is required" }, { status: 400 });

  // Basic domain format validation
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!domainRegex.test(raw)) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  const existing = (client.domains ?? []).find((d) => d.domain === raw);
  if (existing) {
    return NextResponse.json({ error: "Domain already submitted" }, { status: 409 });
  }

  const newEntry = {
    domain: raw,
    status: "pending" as const,
    requestedAt: new Date(),
  };

  const col = await getClientsCollection();
  await col.updateOne(
    { clerkUserId: userId },
    { $push: { domains: newEntry }, $set: { updatedAt: new Date() } }
  );

  return NextResponse.json({ domain: newEntry }, { status: 201 });
}
