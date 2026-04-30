import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Start Building Your Business Website Today",
  description:
    "Ready to get your custom website with analytics, payments, and booking? Contact SAGAH or create your free account and start onboarding today. Available nationwide.",
  keywords: [
    "create business website account",
    "get a custom website",
    "business website consultation",
    "start business online platform",
    "website with analytics signup",
    "custom website quote nationwide",
    "business website free account",
  ],
  alternates: { canonical: "https://sagah.xyz/contact" },
  openGraph: {
    title: "Contact SAGAH — Get Your Custom Business Website",
    description:
      "Create your free account or reach out to get a custom website, analytics dashboard, payments, and booking system. Available to businesses nationwide.",
    url: "https://sagah.xyz/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact SAGAH" }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
