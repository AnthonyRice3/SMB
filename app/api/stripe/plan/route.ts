import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Authentication not configured" }, { status: 503 });
}