import Nav from "../components/Nav";
import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";
import AddSection from "../components/AddSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SAGAH",
  url: "https://sagah.xyz",
  description:
    "Custom website platform with real-time analytics, Stripe payments, appointment booking, and built-in SEO for businesses nationwide. Create your free account and go live in weeks.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://sagah.xyz/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does SAGAH give my business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SAGAH gives your business a fully custom website, a real-time analytics dashboard showing user activity and revenue, Stripe payment processing, an appointment booking system, and built-in SEO — all from a single account. No separate tools, no juggling subscriptions.",
      },
    },
    {
      "@type": "Question",
      name: "Is SAGAH available nationwide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SAGAH is a cloud-based platform available to businesses across the entire United States. Your custom website and analytics dashboard are hosted on a global edge network so your customers get fast load times no matter where they are.",
      },
    },
    {
      "@type": "Question",
      name: "How does the analytics dashboard work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your SAGAH dashboard shows real-time data on user signups, bookings, revenue, pipeline stage, and more. Every metric updates live so you always know exactly how your business is performing — without needing a separate analytics tool.",
      },
    },
    {
      "@type": "Question",
      name: "Can I accept payments through my SAGAH website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SAGAH integrates Stripe Connect so you can accept card payments, one-time charges, and recurring subscriptions directly through your site. Funds transfer to your bank account within two business days.",
      },
    },
    {
      "@type": "Question",
      name: "How fast can I launch my website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most SAGAH clients go live within 2–6 weeks. We handle design, development, payments, authentication, SEO, and deployment. You create your free account, complete the onboarding checklist, and your site ships — no technical experience required.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SAGAH has a free tier that lets you set up your account, explore the dashboard, and start onboarding before you pay anything. Paid plans start at $10/month and unlock lower transaction fees, more users, and priority support.",
      },
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Nav />
      <Hero />
      <AboutSection />
      <AddSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
