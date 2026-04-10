import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://sagah.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SAGAH — Web Design, SEO & AI Apps for Midwest Small Businesses",
    template: "%s | SAGAH",
  },
  description:
    "SAGAH builds custom websites, scheduling apps, AI agents, and SEO strategies for small businesses in the Midwest. Based in the USA — serving IL, IN, OH, MI, MN, WI, MO, IA, KS, NE and beyond.",
  keywords: [
    "web design midwest",
    "web development midwest",
    "small business website design",
    "SEO midwest",
    "local SEO illinois",
    "local SEO indiana",
    "local SEO ohio",
    "local SEO michigan",
    "local SEO minnesota",
    "local SEO wisconsin",
    "local SEO missouri",
    "local SEO iowa",
    "AI agents for small business",
    "scheduling app for small business",
    "business automation midwest",
    "website design chicago",
    "website development illinois",
    "appointment scheduling software",
    "small business SEO",
    "business optimization software",
    "custom web app development",
    "stripe payments integration",
    "SAGAH",
  ],
  authors: [{ name: "SAGAH", url: BASE_URL }],
  creator: "SAGAH",
  publisher: "SAGAH",
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "SAGAH",
    title: "SAGAH — Web Design, SEO & AI Apps for Midwest Small Businesses",
    description:
      "Custom websites, scheduling apps, AI agents, and SEO for small businesses across the Midwest. Launch your app in weeks, not months.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SAGAH — Apps for Small Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAGAH — Web Design, SEO & AI Apps for Midwest Small Businesses",
    description:
      "Custom websites, scheduling apps, AI agents, and SEO for small businesses across the Midwest.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "SAGAH",
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  description:
    "SAGAH builds custom web apps, scheduling systems, AI agents, and SEO solutions for small businesses in the Midwest United States.",
  areaServed: [
    { "@type": "State", name: "Illinois" },
    { "@type": "State", name: "Indiana" },
    { "@type": "State", name: "Ohio" },
    { "@type": "State", name: "Michigan" },
    { "@type": "State", name: "Minnesota" },
    { "@type": "State", name: "Wisconsin" },
    { "@type": "State", name: "Missouri" },
    { "@type": "State", name: "Iowa" },
    { "@type": "State", name: "Kansas" },
    { "@type": "State", name: "Nebraska" },
  ],
  serviceType: [
    "Web Design",
    "Web Development",
    "Search Engine Optimization",
    "AI Agent Development",
    "Scheduling App Development",
    "Business Automation",
    "E-commerce Development",
  ],
  priceRange: "$$",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-full bg-[#07070e] text-white flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
