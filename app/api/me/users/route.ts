import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getClientByClerkUserId,
  getAppUsersCollection,
  getAppMessagesCollection,
  getAppBookingsCollection,
  getAppRevenueCollection,
} from "@/lib/db/client-db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const [userCol, msgCol, bookingCol, revenueCol] = await Promise.all([
      getAppUsersCollection(client.clientId),
      getAppMessagesCollection(client.clientId),
      getAppBookingsCollection(client.clientId),
      getAppRevenueCollection(client.clientId),
    ]);

    const appUsers = await userCol
      .find({})
      .sort({ lastSeenAt: -1 })
      .toArray();

    if (appUsers.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Aggregate message-thread metadata keyed by email
    const emails = appUsers.map((u) => u.email.toLowerCase().trim());
    const threads = await msgCol.aggregate([
      { $match: { userEmail: { $in: emails } } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id:         "$userEmail",
          lastText:    { $last: "$text" },
          lastFrom:    { $last: "$from" },
          lastAt:      { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$from", "user"] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]).toArray();

    const threadMap = new Map(threads.map((t) => [t._id as string, t]));

    const bookingsByEmail = await bookingCol.aggregate([
      {
        $group: {
          _id: "$email",
          bookingsCount: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, 1, 0],
            },
          },
          upcomingServices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "cancelled"] },
                    { $gte: ["$date", new Date().toISOString().slice(0, 10)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]).toArray();

    const purchasesByUserId = await revenueCol.aggregate([
      { $match: { userId: { $exists: true, $type: "string" } } },
      {
        $group: {
          _id: "$userId",
          purchasesCount: {
            $sum: {
              $cond: [{ $ne: ["$status", "failed"] }, 1, 0],
            },
          },
        },
      },
    ]).toArray();

    const bookingMap = new Map(bookingsByEmail.map((b) => [String(b._id), b]));
    const purchaseMap = new Map(purchasesByUserId.map((p) => [String(p._id), p]));

    const users = appUsers.map((u) => {
      const email = u.email.toLowerCase().trim();
      const thread = threadMap.get(email);
      const booking = bookingMap.get(email);
      const purchase = purchaseMap.get(String(u._id));
      return {
        _id:          u._id,
        email:        u.email,
        name:         u.name,
        plan:         u.plan ?? null,
        lastSeenAt:   u.lastSeenAt,
        firstSeenAt:  u.firstSeenAt,
        pageViews:    u.pageViews ?? 0,
        sessionCount: u.sessionCount ?? 0,
        lastText:     thread?.lastText   ?? null,
        lastFrom:     thread?.lastFrom   ?? null,
        lastAt:       thread?.lastAt     ?? null,
        unreadCount:  thread?.unreadCount ?? 0,
        hasMessages:  !!thread,
        bookingsCount: booking?.bookingsCount ?? 0,
        upcomingServices: booking?.upcomingServices ?? 0,
        purchasesCount: purchase?.purchasesCount ?? 0,
      };
    });

    // Unread first, then by lastSeenAt
    users.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[GET /api/me/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}