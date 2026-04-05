import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Web Developer & SEO Specialist in the Midwest",
  description:
    "Meet the team behind SAGAH. We specialize in web design, SEO, AI agents, and scheduling apps for small businesses across Illinois, Indiana, Ohio, Michigan, Minnesota, Wisconsin, and the broader Midwest.",
  keywords: [
    "web developer midwest",
    "SEO specialist illinois",
    "small business developer chicago",
    "AI agent developer midwest",
    "web design agency midwest",
    "business website developer indiana",
    "local web developer ohio",
  ],
  alternates: { canonical: "https://sagah.xyz/about" },
  openGraph: {
    title: "About SAGAH — Midwest Web Design & Business Technology",
    description:
      "We build websites, apps, and AI tools for small businesses in the Midwest. Learn about our mission and team.",
    url: "https://sagah.xyz/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About SAGAH" }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
