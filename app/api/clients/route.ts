/**
 * app/api/clients/route.ts
 *
 * REST endpoint for client account management.
 *
 * POST /api/clients
 *   Registers a new client, provisions their 4 isolated MongoDB collections,
 *   and returns the generated clientId.
 *   Body: { name: string, email: string, plan?: string }
 *
 * GET /api/clients
 *   Returns all clients (admin use only — protect with Clerk auth in production).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, getClientsCollection } from "@/lib/db/client-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, plan } = body as {
      name?: string;
      email?: string;
      plan?: string;
    };

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { clientId, created } = await createClient({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      plan: (plan as never) ?? "Free",
    });

    return NextResponse.json(
      { ok: true, clientId, created },
      { status: created ? 201 : 200 }
    );
  } catch (err) {
    console.error("[POST /api/clients]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clients = await getClientsCollection();
    const list = await clients
      .find(
        {},
        {
          projection: {
            clientId: 1,
            name: 1,
            email: 1,
            plan: 1,
            status: 1,
            pipelineStage: 1,
            collectionsProvisioned: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(list);
  } catch (err) {
    console.error("[GET /api/clients]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
