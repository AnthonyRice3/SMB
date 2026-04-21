/**
 * GET /api/me/messages
 *
 * Returns all message threads for the authenticated client, grouped by userEmail.
 * Each thread includes: userEmail, userName, userId (if set), unreadCount,
 * lastMessage text + date, and the full messages array.
 *
 * Auth: Clerk (authenticated client dashboard user)
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClientByClerkUserId, getAppMessagesCollection } from "@/lib/db/client-db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await getClientByClerkUserId(userId);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const col = await getAppMessagesCollection(client.clientId);

    // Aggregate threads: group by userEmail, get counts + last message
    const threads = await col.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$userEmail",
          userEmail:    { $first: "$userEmail" },
          userName:     { $last: "$userName" },
          userId:       { $first: "$userId" },
          lastText:     { $last: "$text" },
          lastFrom:     { $last: "$from" },
          lastAt:       { $last: "$createdAt" },
          totalCount:   { $sum: 1 },
          unreadCount:  {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$from", "user"] }, { $eq: ["$read", false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ]).toArray();

    return NextResponse.json({ threads });
  } catch (err) {
    console.error("[GET /api/me/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
