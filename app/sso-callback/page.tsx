/**
 * /sso-callback
 *
 * Landing page for Clerk OAuth redirects (Google, etc.).
 * Clerk's AuthenticateWithRedirectCallback handles the token exchange
 * and then redirects the user to redirectUrlComplete ("/dashboard").
 */

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
      {/* Spinner while Clerk processes the OAuth token */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-7 h-7 rounded-md bg-[#FF6B61] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L11 4.5V9L6 11L1 8.5V4L6 1Z" fill="white" />
          </svg>
        </div>
        <div className="w-5 h-5 border-2 border-[#FF6B61]/30 border-t-[#FF6B61] rounded-full animate-spin" />
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
