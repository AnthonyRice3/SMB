import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — Start Free, Scale as You Grow",
  description:
    "SAGAH plans start at $0. Get a custom website, real-time analytics dashboard, Stripe payments, and appointment booking. Upgrade as your business grows — no hidden fees, cancel anytime.",
  keywords: [
    "business website pricing",
    "custom website platform pricing",
    "website with analytics cost",
    "business platform free plan",
    "website and payments pricing",
    "SaaS pricing for small business",
    "free business website account",
  ],
  alternates: { canonical: "https://sagah.xyz/pricing" },
  openGraph: {
    title: "Pricing — SAGAH Custom Website & Analytics Platform",
    description:
      "Start free. Get your custom website, analytics, payments, and booking. Plans from $0 to $35/month with no hidden fees.",
    url: "https://sagah.xyz/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <PricingClient />
      <Footer />
    </>
  );
}
