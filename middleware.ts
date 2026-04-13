import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  try {
    const { userId } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (isAdminRoute(req)) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = (user.publicMetadata as { role?: string } | null)?.role;
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  } catch (err) {
    console.error("[middleware] error:", err);
    return NextResponse.json(
      { error: "Middleware error", detail: String(err) },
      { status: 500 }
    );
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};