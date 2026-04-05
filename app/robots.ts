import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/sign-in/", "/sign-up/", "/sso-callback/"],
      },
    ],
    sitemap: "https://sagah.xyz/sitemap.xml",
    host: "https://sagah.xyz",
  };
}
