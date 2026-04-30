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
    default: "SAGAH — Custom Website Platform with Analytics for Businesses Nationwide",
    template: "%s | SAGAH",
  },
  description:
    "SAGAH gives your business a custom website, real-time analytics dashboard, Stripe payments, booking system, and SEO — all in one platform. Create your free account and launch in weeks, not months.",
  keywords: [
    "custom website platform",
    "business website with analytics",
    "scalable web platform for small business",
    "custom website creation",
    "business analytics dashboard",
    "website builder with payments",
    "Stripe payments for small business",
    "appointment booking website",
    "AI scheduling app",
    "small business SaaS platform",
    "website with built-in CRM",
    "launch a business website fast",
    "custom web app for business",
    "no-code website platform alternative",
    "business automation platform",
    "real-time business analytics",
    "website with user dashboard",
    "website platform nationwide",
    "create business account free",
    "SAGAH platform",
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
    title: "SAGAH — Custom Website + Analytics Platform for Businesses Nationwide",
    description:
      "Get a custom website, real-time analytics, Stripe payments, and a booking system — all under one roof. Create your free account and launch your business online in weeks.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SAGAH — Custom Website & Analytics Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAGAH — Custom Website + Analytics Platform for Businesses Nationwide",
    description:
      "Launch a custom website with real-time analytics, Stripe payments, and a booking system. Free to start — create your account today.",
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
  "@type": "SoftwareApplication",
  name: "SAGAH",
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "SAGAH is a custom website platform that gives businesses a professional site, real-time analytics dashboard, Stripe payments, appointment booking, and SEO — all managed from one account. Available nationwide.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "35",
    offerCount: "4",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Starter", price: "10", priceCurrency: "USD" },
      { "@type": "Offer", name: "Growth", price: "20", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: "35", priceCurrency: "USD" },
    ],
  },
  featureList: [
    "Custom website creation",
    "Real-time business analytics dashboard",
    "Stripe Connect payments",
    "Appointment booking and scheduling",
    "Built-in SEO optimization",
    "User management and authentication",
    "AI-powered scheduling",
    "Business automation",
  ],
  areaServed: { "@type": "Country", name: "United States" },
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
      afterSignOutUrl="/"
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
