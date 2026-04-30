import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Launch Your Custom Website & Analytics Platform",
  description:
    "See how SAGAH works: create your free account, complete onboarding, and get a custom website with real-time analytics, Stripe payments, and appointment booking — live in weeks, not months.",
  keywords: [
    "how to launch a business website",
    "custom website with analytics platform",
    "business website onboarding",
    "website with payments and booking",
    "launch website fast nationwide",
    "business platform how it works",
    "website analytics dashboard setup",
    "create business account and launch website",
  ],
  alternates: { canonical: "https://sagah.xyz/how-it-works" },
  openGraph: {
    title: "How It Works — SAGAH Custom Website & Analytics Platform",
    description:
      "Create your free account, complete onboarding, and get a custom website with analytics, payments, and booking live in weeks.",
    url: "https://sagah.xyz/how-it-works",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How SAGAH works" }],
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
