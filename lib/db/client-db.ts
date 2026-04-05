/**
 * lib/db/client-db.ts
 *
 * Per-client collection helpers.
 *
 * Each SAGAH client (business) gets four isolated MongoDB collections
 * the moment their account is created.  The collections are named:
 *
 *   {clientId}_app_users
 *   {clientId}_app_events
 *   {clientId}_app_bookings
 *   {clientId}_app_revenue
 *
 * clientId is sanitized to [a-z0-9_] so it is safe as a collection prefix.
 * Because the prefix is derived from the authenticated session, clients
 * can never accidentally (or intentionally) read each other's data.
 *
 * Server-only — never import in "use client" components.
 */

import clientPromise from "@/lib/mongodb";
import type {
  AppUserDoc,
  AppEventDoc,
  AppBookingDoc,
  AppRevenueDoc,
  ClientDoc,
  InquiryDoc,
  TicketDoc,
} from "@/lib/db/schema";
import type { Collection } from "mongodb";

const DB_NAME = process.env.MONGODB_DB ?? "SAGAH";

export type ClientCollectionType =
  | "app_users"
  | "app_events"
  | "app_bookings"
  | "app_revenue";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts any string to a safe, lowercase, alphanumeric collection prefix.
 * E.g. "Acme Corp" → "acme_corp", "admin@acme.com" → "admin_acme_com"
 */
export function toClientId(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export function collectionName(
  clientId: string,
  type: ClientCollectionType
): string {
  return `${clientId}_${type}`;
}

// ─── Typed collection accessors ─────────────────────────────────────────────

async function db() {
  const client = await clientPromise();
  return client.db(DB_NAME);
}

export async function getClientsCollection(): Promise<Collection<ClientDoc>> {
  return (await db()).collection<ClientDoc>("clients");
}

export async function getAppUsersCollection(
  clientId: string
): Promise<Collection<AppUserDoc>> {
  return (await db()).collection<AppUserDoc>(
    collectionName(clientId, "app_users")
  );
}

export async function getAppEventsCollection(
  clientId: string
): Promise<Collection<AppEventDoc>> {
  return (await db()).collection<AppEventDoc>(
    collectionName(clientId, "app_events")
  );
}

export async function getAppBookingsCollection(
  clientId: string
): Promise<Collection<AppBookingDoc>> {
  return (await db()).collection<AppBookingDoc>(
    collectionName(clientId, "app_bookings")
  );
}

export async function getAppRevenueCollection(
  clientId: string
): Promise<Collection<AppRevenueDoc>> {
  return (await db()).collection<AppRevenueDoc>(
    collectionName(clientId, "app_revenue")
  );
}

// ─── Collection provisioning ─────────────────────────────────────────────────

/**
 * Creates the four per-client collections and their indexes.
 * Safe to call multiple times — skips collections that already exist.
 * Called once during account creation.
 */
export async function provisionClientCollections(
  clientId: string
): Promise<void> {
  const database = await db();
  const existing = new Set(
    (await database.listCollections().toArray()).map((c) => c.name)
  );

  const collections: {
    type: ClientCollectionType;
    indexes: Parameters<Collection["createIndex"]>[];
  }[] = [
    {
      type: "app_users",
      indexes: [
        [{ email: 1 }, { unique: true }],
        [{ lastSeenAt: -1 }, {}],
        [{ clerkUserId: 1 }, { sparse: true }],
      ],
    },
    {
      type: "app_events",
      indexes: [
        [{ createdAt: -1 }, {}],
        [{ type: 1, createdAt: -1 }, {}],
        [{ userId: 1, createdAt: -1 }, { sparse: true }],
      ],
    },
    {
      type: "app_bookings",
      indexes: [
        [{ date: 1, time: 1 }, {}],
        [{ status: 1, date: 1 }, {}],
        [{ email: 1 }, {}],
      ],
    },
    {
      type: "app_revenue",
      indexes: [
        [{ createdAt: -1 }, {}],
        [{ status: 1, createdAt: -1 }, {}],
        [{ stripePaymentIntentId: 1 }, { sparse: true, unique: true }],
      ],
    },
  ];

  for (const { type, indexes } of collections) {
    const name = collectionName(clientId, type);
    if (!existing.has(name)) {
      await database.createCollection(name);
    }
    const col = database.collection(name);
    for (const [key, opts] of indexes) {
      await col.createIndex(key, opts).catch(() => {
        // Index may already exist — ignore
      });
    }
  }
}

// ─── Account creation ────────────────────────────────────────────────────────

/**
 * Creates a client document in the `clients` collection and provisions
 * all four per-client data collections.  Idempotent — returns the
 * existing clientId if the email is already registered.
 */
export async function createClient(data: {
  name: string;
  email: string;
  plan?: ClientDoc["plan"];
}): Promise<{ clientId: string; created: boolean }> {
  const clients = await getClientsCollection();

  // Derive a stable clientId from the email local-part (before @)
  const base = data.email.split("@")[0];
  let clientId = toClientId(base);

  // Ensure uniqueness — append a short hash if slug already taken by another email
  const existing = await clients.findOne({ email: data.email });
  if (existing) {
    return { clientId: existing.clientId, created: false };
  }

  const taken = await clients.findOne({ clientId });
  if (taken) {
    // Append 4-char suffix to avoid collision
    clientId = `${clientId}_${Date.now().toString(36).slice(-4)}`;
  }

  const now = new Date();
  const doc: ClientDoc = {
    clientId,
    name: data.name,
    email: data.email,
    plan: data.plan ?? "Free",
    status: "trial",
    pipelineStage: 0,
    stripeOnboardingComplete: false,
    collectionsProvisioned: false,
    createdAt: now,
    updatedAt: now,
  };

  await clients.insertOne(doc);
  await provisionClientCollections(clientId);
  await clients.updateOne(
    { clientId },
    { $set: { collectionsProvisioned: true, updatedAt: new Date() } }
  );

  return { clientId, created: true };
}

// ─── Platform: inquiries ─────────────────────────────────────────────────────

export async function getInquiriesCollection(): Promise<Collection<InquiryDoc>> {
  return (await db()).collection<InquiryDoc>("inquiries");
}

// ─── Platform: tickets ───────────────────────────────────────────────────────

export async function getTicketsCollection(): Promise<Collection<TicketDoc>> {
  return (await db()).collection<TicketDoc>("tickets");
}

// ─── Convenience: look up client by Clerk user ID ────────────────────────────

export async function getClientByClerkUserId(
  userId: string
): Promise<ClientDoc | null> {
  const clients = await getClientsCollection();
  return clients.findOne({ clerkUserId: userId }) as Promise<ClientDoc | null>;
}
