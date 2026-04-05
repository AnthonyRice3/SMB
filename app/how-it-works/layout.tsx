import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Custom Web Apps for Small Businesses",
  description:
    "See how SAGAH builds custom websites, AI scheduling apps, SEO strategies, and business automation for small businesses in the Midwest in just a few weeks. Simple process, real results.",
  keywords: [
    "how to get a website built",
    "custom web app process",
    "website development process midwest",
    "small business app development",
    "AI scheduling app how it works",
    "website design process illinois",
    "business automation how it works",
    "book a website consultation",
  ],
  alternates: { canonical: "https://sagah.xyz/how-it-works" },
  openGraph: {
    title: "How It Works — SAGAH Web Design & App Development",
    description:
      "A simple 4-step process to get your custom website, scheduling app, or AI agent live in weeks, not months.",
    url: "https://sagah.xyz/how-it-works",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How SAGAH works" }],
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
