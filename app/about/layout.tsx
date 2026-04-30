import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — The Platform Built to Launch Your Business Online",
  description:
    "SAGAH is a nationwide platform that gives businesses a custom website, analytics dashboard, payment processing, and booking system — all from one account. No development team required.",
  keywords: [
    "custom website platform",
    "business website with analytics",
    "launch business online",
    "website platform for small business",
    "business software nationwide",
    "scalable website platform",
    "no-code business platform",
  ],
  alternates: { canonical: "https://sagah.xyz/about" },
  openGraph: {
    title: "About SAGAH — Custom Website & Analytics Platform",
    description:
      "Learn how SAGAH gives businesses across the US a custom website, real-time analytics, payments, and booking — in one platform.",
    url: "https://sagah.xyz/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About SAGAH" }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
