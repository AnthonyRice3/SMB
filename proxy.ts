import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  try {
    const { userId, sessionClaims } = await auth();

    console.log("[proxy] path:", req.nextUrl.pathname, "userId:", userId);

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Admin routes require role = "admin"
    const isAdmin = createRouteMatcher(["/admin(.*)"]);
    if (isAdmin(req)) {
      const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  } catch (err) {
    console.error("[proxy] middleware error:", err);
    return NextResponse.json(
      { error: "Middleware error", detail: String(err) },
      { status: 500 }
    );
  }
}, { debug: true });

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
