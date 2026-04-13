import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Authentication not configured" }, { status: 503 });
}