import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Get a Free Website & SEO Consultation",
  description:
    "Ready to get a custom website, scheduling app, or SEO strategy for your Midwest small business? Contact SAGAH for a free consultation. We serve Illinois, Indiana, Ohio, Michigan, Minnesota, Wisconsin, Missouri, and more.",
  keywords: [
    "free website consultation midwest",
    "web design quote illinois",
    "contact web developer midwest",
    "small business SEO consultation",
    "get a website quote",
    "hire web developer midwest",
    "website design pricing midwest",
  ],
  alternates: { canonical: "https://sagah.xyz/contact" },
  openGraph: {
    title: "Contact SAGAH — Free Consultation for Midwest Small Businesses",
    description:
      "Get a free consultation for your website, scheduling app, AI agents, or SEO. We work with small businesses across the Midwest.",
    url: "https://sagah.xyz/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact SAGAH" }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
