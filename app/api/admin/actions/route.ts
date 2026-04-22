import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getClientsCollection,
  getConsultationsCollection,
  getInquiriesCollection,
  getAppEventsCollection,
  getAppBookingsCollection,
  getAppRevenueCollection,
  getAppMessagesCollection,
} from "@/lib/db/client-db";

type ActionItem = {
  id: string;
  at: string;
  scope: "platform" | "client-app";
  actorType: "client" | "user" | "system";
  actor: string;
  clientId: string | null;
  action: string;
  details: string;
};

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata as { role?: string } | null)?.role === "admin";
}

function asIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date(0).toISOString();
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const clientsCol = await getClientsCollection();
    const [clients, inquiries, consultations] = await Promise.all([
      clientsCol.find({}).toArray(),
      (await getInquiriesCollection()).find({}).sort({ createdAt: -1 }).limit(100).toArray(),
      (await getConsultationsCollection()).find({}).sort({ createdAt: -1 }).limit(100).toArray(),
    ]);

    const actions: ActionItem[] = [];

    for (const c of clients) {
      actions.push({
        id: `client-created-${String(c._id)}`,
        at: asIso(c.createdAt),
        scope: "platform",
        actorType: "client",
        actor: c.name,
        clientId: c.clientId,
        action: "Client Created",
        details: `${c.email} joined on ${c.plan}`,
      });

      if (asIso(c.updatedAt) !== asIso(c.createdAt)) {
        actions.push({
          id: `client-updated-${String(c._id)}`,
          at: asIso(c.updatedAt),
          scope: "platform",
          actorType: "client",
          actor: c.name,
          clientId: c.clientId,
          action: "Client Updated",
          details: `Status ${c.status} · Plan ${c.plan}`,
        });
      }
    }

    for (const i of inquiries) {
      actions.push({
        id: `inquiry-${String(i._id)}`,
        at: asIso(i.createdAt),
        scope: "platform",
        actorType: "user",
        actor: i.name,
        clientId: null,
        action: "Inquiry Submitted",
        details: `${i.type} · ${i.email}`,
      });
    }

    for (const c of consultations) {
      actions.push({
        id: `consultation-${String(c._id)}`,
        at: asIso(c.createdAt),
        scope: "platform",
        actorType: "user",
        actor: c.name,
        clientId: null,
        action: "Consultation Requested",
        details: `${c.topic} · ${c.date} ${c.time}`,
      });
    }

    for (const c of clients) {
      const [events, bookings, revenue, messages] = await Promise.all([
        (await getAppEventsCollection(c.clientId)).find({}).sort({ createdAt: -1 }).limit(40).toArray(),
        (await getAppBookingsCollection(c.clientId)).find({}).sort({ createdAt: -1 }).limit(40).toArray(),
        (await getAppRevenueCollection(c.clientId)).find({}).sort({ createdAt: -1 }).limit(40).toArray(),
        (await getAppMessagesCollection(c.clientId)).find({}).sort({ createdAt: -1 }).limit(40).toArray(),
      ]);

      for (const e of events) {
        actions.push({
          id: `event-${c.clientId}-${String(e._id)}`,
          at: asIso(e.createdAt),
          scope: "client-app",
          actorType: "user",
          actor: e.userId ?? "anonymous",
          clientId: c.clientId,
          action: `Event: ${e.type}`,
          details: `${e.page ?? "(no page)"}`,
        });
      }

      for (const b of bookings) {
        actions.push({
          id: `booking-${c.clientId}-${String(b._id)}`,
          at: asIso(b.createdAt),
          scope: "client-app",
          actorType: "user",
          actor: b.name,
          clientId: c.clientId,
          action: `Booking ${b.status}`,
          details: `${b.service} · ${b.date} ${b.time}`,
        });
      }

      for (const r of revenue) {
        actions.push({
          id: `revenue-${c.clientId}-${String(r._id)}`,
          at: asIso(r.createdAt),
          scope: "client-app",
          actorType: "user",
          actor: r.userId ?? "unknown-user",
          clientId: c.clientId,
          action: `Payment ${r.status}`,
          details: `${(r.amount / 100).toFixed(2)} ${r.currency.toUpperCase()} · ${r.type}`,
        });
      }

      for (const m of messages) {
        actions.push({
          id: `message-${c.clientId}-${String(m._id)}`,
          at: asIso(m.createdAt),
          scope: "client-app",
          actorType: m.from === "client" ? "client" : "user",
          actor: m.from === "client" ? c.name : m.userName,
          clientId: c.clientId,
          action: m.from === "client" ? "Client Replied" : "User Messaged",
          details: m.text.slice(0, 80),
        });
      }
    }

    actions.sort((a, b) => (a.at < b.at ? 1 : -1));
    const recent = actions.slice(0, 300);

    return NextResponse.json({
      total: actions.length,
      byScope: {
        platform: actions.filter((a) => a.scope === "platform").length,
        clientApps: actions.filter((a) => a.scope === "client-app").length,
      },
      recent,
    });
  } catch (err) {
    console.error("[GET /api/admin/actions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
