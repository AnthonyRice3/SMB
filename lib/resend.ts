import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[resend] RESEND_API_KEY is not set — emails will not be sent");
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

/** Default from-address used for all platform emails */
export const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "SAGAH <notifications@sagah.xyz>";
