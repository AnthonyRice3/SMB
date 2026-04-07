/**
 * lib/v1-auth.ts
 *
 * Shared auth helper for SAGAH's public v1 API.
 * Clients authenticate by sending their API key in the Authorization header:
 *
 *   Authorization: Bearer sgk_<hex>
 *
 * Returns the ClientDoc on success, or null on failure.
 */

import type { NextRequest } from "next/server";
import type { ClientDoc } from "@/lib/db/schema";
import { getClientByApiKey } from "@/lib/db/client-db";

export async function requireApiKey(
  req: NextRequest
): Promise<ClientDoc | null> {
  const auth = req.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!key) return null;
  return getClientByApiKey(key);
}
