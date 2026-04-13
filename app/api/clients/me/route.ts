import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient, getClientsCollection } from "@/lib/db/client-db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clients = await getClientsCollection();
    let client = await clients.findOne(
      { clerkUserId: userId },
      {
        projection: {
          _id: 0, clientId: 1, name: 1, email: 1, plan: 1, status: 1,
          pipelineStage: 1, stripeAccountId: 1, stripeOnboardingComplete: 1,
          stripeSubscriptionId: 1, collectionsProvisioned: 1, apiKey: 1, createdAt: 1,
        },
      }
    );

    if (!client) {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const primaryEmail =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
      if (!primaryEmail)
        return NextResponse.json({ error: "No email on Clerk account" }, { status: 422 });

      const businessName = (clerkUser.unsafeMetadata as { businessName?: string } | null)?.businessName;
      const nameParts = [clerkUser.firstName, clerkUser.lastName].filter(Boolean);
      const name = businessName || nameParts.join(" ") || "Unknown";

      const { clientId } = await createClient({ name, email: primaryEmail, plan: "Free" });
      await clients.updateOne({ clientId }, { $set: { clerkUserId: userId, updatedAt: new Date() } });
      client = await clients.findOne(
        { clerkUserId: userId },
        {
          projection: {
            _id: 0, clientId: 1, name: 1, email: 1, plan: 1, status: 1,
            pipelineStage: 1, stripeAccountId: 1, stripeOnboardingComplete: 1,
            stripeSubscriptionId: 1, collectionsProvisioned: 1, apiKey: 1, createdAt: 1,
          },
        }
      );
    }

    if (client && !client.apiKey) {
      const { randomBytes } = await import("crypto");
      const apiKey = `sgk_${randomBytes(20).toString("hex")}`;
      await clients.updateOne({ clerkUserId: userId }, { $set: { apiKey, updatedAt: new Date() } });
      (client as Record<string, unknown>).apiKey = apiKey;
    }

    return NextResponse.json(client);
  } catch (err) {
    console.error("[GET /api/clients/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}