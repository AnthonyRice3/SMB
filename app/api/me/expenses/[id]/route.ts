import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({ error: "Authentication not configured" }, { status: 503 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Authentication not configured" }, { status: 503 });
}