import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId, sessionId, sessionClaims } = await auth();

  // List all cookies the server sees
  const cookies: Record<string, string> = {};
  req.cookies.getAll().forEach((c) => {
    cookies[c.name] = c.value.substring(0, 30) + (c.value.length > 30 ? "…" : "");
  });

  return NextResponse.json({
    userId,
    sessionId,
    hasClaims: !!sessionClaims,
    cookieNames: Object.keys(cookies),
    cookies,
    timestamp: new Date().toISOString(),
  });
}
