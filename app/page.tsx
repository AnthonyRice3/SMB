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
    "Custom websites, scheduling apps, AI agents, and SEO for small businesses across the Midwest United States.",
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
      name: "Do you build websites for small businesses in the Midwest?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SAGAH specializes in custom websites and web apps for small businesses across Illinois, Indiana, Ohio, Michigan, Minnesota, Wisconsin, Missouri, Iowa, Kansas, Nebraska, and the broader Midwest.",
      },
    },
    {
      "@type": "Question",
      name: "What is Stripe Connect and can you integrate it into my website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe Connect lets your business accept payments online. SAGAH can integrate Stripe Connect into your website so customers can pay you directly — no technical knowledge required on your end.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer SEO services for local Midwest businesses?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We provide local SEO strategies targeted at Midwest markets to help your business rank higher in Google searches for your city and region.",
      },
    },
    {
      "@type": "Question",
      name: "Can you build an AI scheduling or booking app for my business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. SAGAH builds custom appointment scheduling apps with AI-powered features — allowing your customers to book online 24/7 from any device.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly can you build and launch my website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most projects go live in 2–6 weeks depending on complexity. We handle design, development, payments, authentication, and deployment so you can focus on your business.",
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
