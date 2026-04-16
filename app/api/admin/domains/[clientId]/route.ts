import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { getClientsCollection } from "@/lib/db/client-db";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

// PATCH /api/admin/domains/[clientId]
// Body: { domain: string; action: "approve" | "decline" | "active" }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clientId } = await params;

  let body: { domain?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain, action } = body;
  if (!domain || !action) {
    return NextResponse.json({ error: "domain and action are required" }, { status: 400 });
  }

  const validActions = ["approve", "decline", "active"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "action must be approve, decline, or active" }, { status: 400 });
  }

  const col = await getClientsCollection();

  // clientId here is the MongoDB _id string
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(clientId);
  } catch {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  const client = await col.findOne({ _id: objectId });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const domains = client.domains ?? [];
  const idx = domains.findIndex((d: { domain: string }) => d.domain === domain);
  if (idx === -1) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const statusMap: Record<string, "pending" | "approved" | "declined" | "active"> = {
    approve: "approved",
    decline: "declined",
    active: "active",
  };

  domains[idx] = {
    ...domains[idx],
    status: statusMap[action],
    resolvedAt: new Date(),
  };

  await col.updateOne(
    { _id: objectId },
    { $set: { domains, updatedAt: new Date() } }
  );

  return NextResponse.json({ domain: domains[idx] });
}
