import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionCookie =
    req.cookies.get("__session")?.value ??
    req.cookies.get("__session_-k6NLSjr")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "No __session cookie found" });
  }

  // Decode JWT header + payload (without verifying signature)
  const parts = sessionCookie.split(".");
  if (parts.length !== 3) {
    return NextResponse.json({ error: "Malformed JWT", parts: parts.length });
  }

  const decodeBase64Url = (s: string) => {
    const padded = s.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  };

  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  const expired = payload.exp ? payload.exp < now : "no exp claim";

  // Try fetching JWKS to verify the key ID matches
  let jwksKeyIds: string[] = [];
  try {
    const jwksUrl = `https://clerk.sagah.xyz/.well-known/jwks.json`;
    const res = await fetch(jwksUrl);
    const jwks = await res.json();
    jwksKeyIds = jwks.keys?.map((k: { kid: string }) => k.kid) ?? [];
  } catch {
    jwksKeyIds = ["FETCH_FAILED"];
  }

  return NextResponse.json({
    header,
    payload: {
      sub: payload.sub,
      iss: payload.iss,
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat,
      nbf: payload.nbf,
      sid: payload.sid,
      azp: payload.azp,
    },
    expired,
    nowUnix: now,
    jwksKeyIds,
    kidMatch: jwksKeyIds.includes(header.kid),
    envPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + "…",
    hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    secretKeyPrefix: process.env.CLERK_SECRET_KEY?.substring(0, 12) + "…",
  });
}
