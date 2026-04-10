import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing. Start free, scale as you grow. Choose the plan that fits your business — no hidden fees.",
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
