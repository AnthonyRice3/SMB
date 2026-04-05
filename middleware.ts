import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute    = createRouteMatcher(["/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicRoute   = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/how-it-works(.*)",
  "/forgot-password(.*)",
  "/api/webhook(.*)",
  "/api/inquiries(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Admin routes: must be signed in AND have role=admin
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes: must be signed in
  if (isDashboardRoute(req)) {
    await auth.protect();
    return NextResponse.next();
  }

  // Public routes: no restriction
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Everything else: no restriction
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
