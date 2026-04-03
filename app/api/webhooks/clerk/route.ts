/**
 * POST /api/webhooks/clerk
 *
 * Receives Clerk webhook events and syncs user data to MongoDB.
 *
 * The webhook signature is verified using svix before any DB writes occur.
 *
 * Handled events:
 *   user.created  — creates a ClientDoc in MongoDB; uses email as identity key
 *   user.updated  — updates name / email on the existing ClientDoc
 *   user.deleted  — marks the client as inactive (soft delete)
 *
 * ─── Clerk Dashboard setup ────────────────────────────────────────────────
 *  Clerk Dashboard → Configure → Webhooks → Add Endpoint
 *  URL    : https://yourdomain.com/api/webhooks/clerk
 *  Events : user.created  user.updated  user.deleted
 *  Copy the Signing Secret → paste into .env as CLERK_WEBHOOK_SECRET
 * ──────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createClient, getClientsCollection } from "@/lib/db/client-db";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserPayload {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
}

function getPrimaryEmail(payload: ClerkUserPayload): string | null {
  const primary = payload.email_addresses.find(
    (e) => e.id === payload.primary_email_address_id
  );
  return primary?.email_address ?? payload.email_addresses[0]?.email_address ?? null;
}

function getFullName(payload: ClerkUserPayload): string {
  const parts = [payload.first_name, payload.last_name].filter(Boolean);
  return parts.join(" ") || "Unknown";
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhook/clerk] CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Read and verify the raw body
  const rawBody = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  let event: { type: string; data: ClerkUserPayload };

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: ClerkUserPayload };
  } catch (err) {
    console.error("[webhook/clerk] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    switch (type) {
      // ── New user signed up ────────────────────────────────────────────────
      case "user.created": {
        const email = getPrimaryEmail(data);
        if (!email) break;

        const name = getFullName(data);

        // createClient is idempotent — returns existing if email already registered
        const { clientId, created } = await createClient({ name, email, plan: "Free" });

        // Store the Clerk user ID on the client document
        const clients = await getClientsCollection();
        await clients.updateOne(
          { clientId },
          { $set: { clerkUserId: data.id, updatedAt: new Date() } }
        );

        console.log(`[webhook/clerk] user.created → clientId=${clientId} created=${created}`);
        break;
      }

      // ── User updated name or primary email ───────────────────────────────
      case "user.updated": {
        const email = getPrimaryEmail(data);
        const name = getFullName(data);

        const clients = await getClientsCollection();
        await clients.updateOne(
          { clerkUserId: data.id },
          {
            $set: {
              ...(name && { name }),
              ...(email && { email }),
              updatedAt: new Date(),
            },
          }
        );
        break;
      }

      // ── User deleted — soft-delete (keep data, mark inactive) ────────────
      case "user.deleted": {
        const clients = await getClientsCollection();
        await clients.updateOne(
          { clerkUserId: data.id },
          { $set: { status: "inactive", updatedAt: new Date() } }
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook/clerk] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
