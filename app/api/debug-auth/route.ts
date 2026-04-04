import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, sessionId, sessionClaims } = await auth();

  return NextResponse.json({
    userId,
    sessionId,
    hasClaims: !!sessionClaims,
    timestamp: new Date().toISOString(),
  });
}
