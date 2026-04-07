/**
 * POST /api/v1/email/send
 *
 * Send a transactional email via SAGAH's Resend account on behalf of the
 * calling client's app. SAGAH's from-domain is used unless the client has
 * configured a custom domain (future).
 *
 * Headers:
 *   Authorization: Bearer sgk_<key>
 *
 * Body:
 *   to       — required, recipient email or array of emails
 *   subject  — required
 *   html     — required, HTML body
 *   text     — optional, plain-text fallback
 *   replyTo  — optional, reply-to address
 *
 * Returns: { id } (Resend message ID)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/v1-auth";
import { resend, FROM_ADDRESS } from "@/lib/resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const client = await requireApiKey(req);
  if (!client) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { to, subject, html, text, replyTo } = body as Record<string, unknown>;

  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: "to, subject, and html are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const toList = Array.isArray(to) ? (to as string[]) : [String(to)];

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toList,
      subject: String(subject),
      html: String(html),
      ...(text ? { text: String(text) } : {}),
      ...(replyTo ? { replyTo: String(replyTo) } : {}),
      tags: [{ name: "sagah_client_id", value: client.clientId }],
    });

    if (error) {
      console.error("[POST /api/v1/email/send] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 502, headers: corsHeaders });
    }

    return NextResponse.json({ id: data?.id }, { headers: corsHeaders });
  } catch (err) {
    console.error("[POST /api/v1/email/send]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
