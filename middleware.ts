/**
 * middleware.ts
 *
 * Clerk auth middleware for SAGAH.
 *
 * Protected routes:
 *   /dashboard/*  — authenticated SAGAH clients only
 *   /admin/*      — must also have the "admin" public metadata role
 *
 * Public routes (no auth required):
 *   /              landing page
 *   /about
 *   /how-it-works
 *   /contact
 *   /sign-in, /sign-up  — Clerk auth pages
 *   /api/webhooks/*     — Stripe + Clerk webhooks (verified by their own signatures)
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/about",
  "/how-it-works",
  "/contact",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
  "/api/stripe/webhook",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();

  // Not signed in → redirect to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Admin routes require role = "admin" in Clerk public metadata
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
