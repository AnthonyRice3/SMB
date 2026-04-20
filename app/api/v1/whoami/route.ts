/**
 * GET /api/v1/whoami
 *
 * Returns the SAGAH client that the provided API key resolves to.
 * Use this to verify that your build is using the correct API key.
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Returns: { clientId, name, email, plan, stripeConnected }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  return NextResponse.json(
    {
      clientId:        client.clientId,
      name:            client.name,
      email:           client.email,
      plan:            client.plan ?? "Free",
      stripeConnected: !!(client.stripeAccountId && client.stripeOnboardingComplete),
      stripeAccountId: client.stripeAccountId ?? null,
    },
    { headers: corsHeaders }
  );
}
