"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

/* ─── Mockup: Sign Up ───────────────────────────────────────────────────── */
function MockupSignup() {
  return (
    <div className="bg-[#0a0a15] rounded-2xl border border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <div className="w-3 h-3 rounded bg-[#FF6B61] flex-shrink-0" />
        <span className="text-[11px] font-semibold text-white">SAGAH</span>
        <div className="ml-auto flex gap-3">
          {["Features", "About", "Pricing"].map((l) => (
            <span key={l} className="text-[9px] text-white/25">{l}</span>
          ))}
        </div>
      </div>
      <div className="px-5 pt-5 pb-6">
        <div className="text-[9px] font-semibold text-[#FF6B61] tracking-widest uppercase mb-2">For entrepreneurs</div>
        <div className="text-sm font-extrabold text-white leading-tight mb-2">
          Build your SMB platform<br />in days, not months.
        </div>
        <div className="text-[10px] text-white/35 mb-4 max-w-[210px]">
          Payments, auth, analytics and SEO — production-ready from day one.
        </div>
        <div className="flex gap-2 mb-4">
          <div className="bg-[#FF6B61] text-white text-[9px] font-bold px-3 py-1.5 rounded-full">Create free account</div>
          <div className="bg-white/[0.05] border border-white/[0.08] text-white/45 text-[9px] font-medium px-3 py-1.5 rounded-full">See a demo →</div>
        </div>
        <div className="flex gap-4">
          {["No credit card", "2-min setup", "Free to start"].map((f) => (
            <div key={f} className="flex items-center gap-1">
              <svg className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[9px] text-white/30">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup: Booking calendar ──────────────────────────────────────────── */
function MockupBook() {
  const days = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const disabled = new Set([1, 2, 5, 6, 7, 12, 13, 19, 20, 26, 27]);
  return (
    <div className="bg-[#0a0a15] rounded-2xl border border-white/[0.07] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="text-[11px] font-semibold text-white">Schedule your strategy call</div>
        <div className="text-[9px] text-white/30 mt-0.5">April 2026  ·  30 or 60 minutes</div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-[8px] font-medium text-white/20">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-3">
          {days.map((d, i) =>
            d === null ? (
              <div key={`e${i}`} />
            ) : (
              <div
                key={d}
                className={`aspect-square rounded-md flex items-center justify-center text-[9px] ${
                  d === 9
                    ? "bg-[#FF6B61] text-white font-bold"
                    : disabled.has(d)
                    ? "text-white/10"
                    : "text-white/45"
                }`}
              >
                {d}
              </div>
            )
          )}
        </div>
        <div className="text-[9px] text-white/25 mb-1.5">Thu Apr 9 · Available times</div>
        <div className="flex gap-1.5 flex-wrap">
          {["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"].map((t, i) => (
            <div
              key={t}
              className={`text-[9px] px-2 py-1 rounded-lg font-medium ${
                i === 1 ? "bg-[#FF6B61] text-white" : "bg-white/[0.04] text-white/35 border border-white/[0.06]"
              }`}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup: SEO scores ─────────────────────────────────────────────────── */
function MockupSEO() {
  const scores = [
    { label: "Performance", score: 94, color: "bg-emerald-400" },
    { label: "SEO", score: 100, color: "bg-emerald-400" },
    { label: "Accessibility", score: 97, color: "bg-emerald-400" },
    { label: "Best Practices", score: 96, color: "bg-blue-400" },
  ];
  return (
    <div className="bg-[#0a0a15] rounded-2xl border border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.06] bg-white/[0.015]">
        {["bg-red-500/50", "bg-amber-400/50", "bg-emerald-500/50"].map((c) => (
          <div key={c} className={`w-2 h-2 rounded-full ${c}`} />
        ))}
        <div className="ml-2 flex-1 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-0.5 text-[9px] text-white/30">
          yourbusiness.com
        </div>
      </div>
      <div className="p-4">
        <div className="text-[9px] text-white/30 mb-3">Google Lighthouse  ·  Production</div>
        {scores.map(({ label, score, color }) => (
          <div key={label} className="mb-2.5">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] text-white/50">{label}</span>
              <span className="text-[9px] font-bold text-white">{score}</span>
            </div>
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${color} rounded-full`}
                initial={{ width: 0 }}
                whileInView={{ width: `${score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.2 }}
              />
            </div>
          </div>
        ))}
        <div className="mt-3 p-2 bg-emerald-400/[0.07] border border-emerald-400/20 rounded-lg text-center">
          <span className="text-[9px] text-emerald-400 font-semibold">↑ 312% organic traffic this month</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup: Stripe revenue ─────────────────────────────────────────────── */
function MockupStripe() {
  const bars = [32, 41, 38, 55, 48, 72, 68, 84, 79, 95, 88, 100];
  return (
    <div className="bg-[#0a0a15] rounded-2xl border border-white/[0.07] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center">
        <span className="text-[11px] font-semibold text-white">Stripe Connect</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { l: "MRR", v: "$4,830", s: "↑ 18% vs last mo.", c: "text-emerald-400" },
            { l: "Active subs", v: "47", s: "↑ 6 new this week", c: "text-emerald-400" },
            { l: "Net volume", v: "$18,420", s: "This month", c: "text-white/30" },
            { l: "Avg. LTV", v: "$312", s: "↑ 14% this quarter", c: "text-emerald-400" },
          ].map(({ l, v, s, c }) => (
            <div key={l}>
              <div className="text-[8px] text-white/25 mb-0.5">{l}</div>
              <div className="text-xs font-bold text-white">{v}</div>
              <div className={`text-[8px] ${c}`}>{s}</div>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-0.5 h-10">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm bg-emerald-400/25"
              style={{ height: `${h}%`, transformOrigin: "bottom" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            />
          ))}
        </div>
        <div className="text-[8px] text-white/15 text-right mt-1">Monthly recurring revenue  ·  Last 12 months</div>
      </div>
    </div>
  );
}

/* ─── Mockup: Admin analytics ────────────────────────────────────────────── */
function MockupAdmin() {
  const pts = [20, 28, 24, 38, 32, 47, 41, 58, 52, 67, 60, 78, 72, 88, 82, 95];
  const W = 220, H = 56;
  const polyPts = pts.map((v, i) => `${(i / (pts.length - 1)) * W},${H - (v / 95) * H}`).join(" ");
  return (
    <div className="bg-[#0a0a15] rounded-2xl border border-white/[0.07] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center">
        <span className="text-[11px] font-semibold text-white">Admin Dashboard</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B61] animate-pulse" />
          <span className="text-[9px] text-white/25 ml-1">Real-time</span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { l: "Page views", v: "31,204", d: "↑ 18%", c: "text-blue-400" },
            { l: "Conversion", v: "3.8%", d: "↑ 0.4%", c: "text-violet-400" },
            { l: "MRR", v: "$4,830", d: "↑ 12%", c: "text-[#FF6B61]" },
          ].map(({ l, v, d, c }) => (
            <div key={l} className="bg-white/[0.03] rounded-lg p-2">
              <div className="text-[7px] text-white/25 mb-0.5">{l}</div>
              <div className={`text-[11px] font-bold ${c}`}>{v}</div>
              <div className="text-[8px] text-emerald-400">{d}</div>
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
          <defs>
            <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B61" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FF6B61" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${H} ${polyPts} ${W},${H}`} fill="url(#admGrad)" />
          <polyline points={polyPts} fill="none" stroke="#FF6B61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-1.5 flex justify-between text-[8px] text-white/15">
          {["Jan", "Mar", "May", "Jul", "Sep", "Now"].map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ─── Step data ──────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    numGradient: "from-violet-400 to-purple-500",
    category: "Getting started",
    categoryColor: "text-violet-400",
    categoryBorder: "border-violet-400/20",
    categoryBg: "bg-violet-400/[0.08]",
    title: "Explore the platform and create your free account",
    paragraphs: [
      "Browse the SAGAH homepage to see exactly what the platform provides: a complete, production-grade tech stack that any entrepreneur can own and operate without hiring a development team. Every feature — authentication, payments, email, analytics, and SEO — is pre-built, tested, and ready to configure for your specific niche.",
      "Creating your account takes under two minutes with no credit card required. From your first login you get access to a live sandbox dashboard, a guided onboarding checklist, and the booking calendar so you can immediately reserve your personalized strategy call. There is nothing to install, configure, or deploy — your environment is already running.",
    ],
    insightHeadline: "Stop paying for 5 separate tools",
    insightBody:
      "The average entrepreneur cobbles together Webflow ($23/mo), an auth provider ($35/mo), email marketing ($50/mo), analytics add-ons, and a Stripe integration layer — totalling over $1,600 per year before writing a single line of product code. SAGAH replaces all of it on one platform, provisioned and running on day one.",
    insightHighlight: "Save $1,600+ per year in SaaS overhead starting immediately.",
    reverseMockup: false,
  },
  {
    num: "02",
    numGradient: "from-blue-400 to-cyan-500",
    category: "Strategy",
    categoryColor: "text-blue-400",
    categoryBorder: "border-blue-400/20",
    categoryBg: "bg-blue-400/[0.08]",
    title: "Book a personalized demo and get your implementation roadmap",
    paragraphs: [
      "Use the built-in booking calendar to reserve a 30 or 60-minute strategy session with an SAGAH specialist. Before the call, a brief intake form captures your business model — whether you are a service provider, e-commerce seller, content creator, or micro-SaaS founder. That context means we arrive at the call already tailored to your exact situation.",
      "During the session we walk through your target audience, your monetization model, the features you need most, and any technical constraints or existing tools. You leave with a documented implementation roadmap: which integrations to activate first, which pages drive the most conversions in your vertical, and a realistic timeline to your first paying customer. This is a free technical planning session — not a sales call.",
    ],
    insightHeadline: "The fastest path to your first paying customer",
    insightBody:
      "Entrepreneurs who complete a strategy session before building ship their first version 3x faster on average, because they avoid the three most expensive dead ends: over-engineering authentication before anyone has signed up, misunderstanding Stripe fee structures, and building features nobody asked for. One focused hour of planning eliminates weeks of rework and thousands in wasted hours.",
    insightHighlight: "3x faster time to first paying customer vs. going it alone.",
    reverseMockup: true,
  },
  {
    num: "03",
    numGradient: "from-emerald-400 to-teal-500",
    category: "Your website",
    categoryColor: "text-emerald-400",
    categoryBorder: "border-emerald-400/20",
    categoryBg: "bg-emerald-400/[0.08]",
    title: "Receive a production-ready full-stack website built for search and growth",
    paragraphs: [
      "After your strategy session, your full-stack website is provisioned and deployed to a global edge network. The tech stack — Next.js App Router, TypeScript, Tailwind CSS, and server-side rendering — is chosen because it produces the fastest possible page load times while staying fully customizable. You get a single codebase that handles your marketing pages, user authentication, dashboard, and admin panel.",
      "Every public page ships with production-grade SEO from day one: server-rendered meta titles and descriptions, Open Graph and Twitter card images so your links look polished on social media, a dynamically generated sitemap.xml, robots.txt, and JSON-LD structured data that tells Google exactly what your business offers. Pages load in under 800 milliseconds on mobile, which directly affects your search ranking. Your domain, HTTPS certificate, and CDN delivery are all configured and ready.",
    ],
    insightHeadline: "Organic traffic is revenue your ad budget cannot buy",
    insightBody:
      "53% of all web traffic comes from organic search. A position-1 Google ranking for your niche keywords can generate 200 to 400 qualified visitors per day at zero cost per click, compounding every month. Every one-second improvement in load time reduces your bounce rate by up to 32%, which means more visitors reach your pricing page and become customers. Better SEO built today keeps paying dividends for years.",
    insightHighlight: "Page 1 rankings generate 10x more traffic than page 2 — at $0 per click.",
    reverseMockup: false,
  },
  {
    num: "04",
    numGradient: "from-amber-400 to-orange-500",
    category: "Payments",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-400/20",
    categoryBg: "bg-amber-400/[0.08]",
    title: "Connect Stripe and start earning revenue from day one",
    paragraphs: [
      "Stripe Connect is configured directly from your admin panel. Choose one-time products, recurring subscription tiers, or usage-based billing and activate them without touching backend code. Your checkout page is served with your brand colors, your logo, and automatic support for Apple Pay, Google Pay, and buy-now-pay-later options through Stripe's payment request UI — giving every customer their preferred way to pay.",
      "Stripe handles PCI DSS compliance, automated fraud detection via Stripe Radar, tax calculation across 40+ countries, and smart dunning: automatic retries on failed charges and customer recovery emails that recover an average of 26% of payments that would otherwise be lost. Revenue flows to your connected bank account within two business days. Every transaction, refund, and dispute is visible in real time in both Stripe's dashboard and your SAGAH admin panel.",
    ],
    insightHeadline: "Subscriptions turn one-time buyers into compounding revenue",
    insightBody:
      "A one-time sale earns you money once. A subscription earns you money every single month while you sleep. Adding a single $29 per month tier with just 50 subscribers generates $17,400 in annual recurring revenue that renews automatically. Layer in a $79 premium tier with 15 subscribers and you are already at $31,620 in ARR. With Stripe's dunning and automatic plan upgrades, that number grows without any manual effort on your part.",
    insightHighlight: "50 subscribers at $29/mo = $17,400/year — renewning automatically every month.",
    reverseMockup: true,
  },
  {
    num: "05",
    numGradient: "from-[#FF6B61] to-rose-500",
    category: "Growth",
    categoryColor: "text-[#FF6B61]",
    categoryBorder: "border-[#FF6B61]/25",
    categoryBg: "bg-[#FF6B61]/[0.08]",
    title: "Monitor your business and make data-driven decisions from your admin panel",
    paragraphs: [
      "Once your platform is live, the admin dashboard gives you real-time visibility into every metric that drives revenue decisions. Page view trends, session duration, and funnel drop-off rates reveal which parts of your site need attention. User cohort tables show when customers churn and what their last action was. Revenue graphs break down MRR, ARR, and month-over-month growth so pattern recognition happens at a glance — not buried in a spreadsheet.",
      "The actions log captures user activity at the event level: sign-ups, button clicks, purchases, plan upgrades, and cancellations. You can pinpoint exactly where users hesitate and where they convert with confidence. Manage subscriptions manually for high-value clients, export user lists for outreach campaigns, schedule follow-up consultations, and respond to inquiries — all from the same authenticated admin interface, on any device, from anywhere in the world.",
    ],
    insightHeadline: "Every data point is a revenue unlock waiting to happen",
    insightBody:
      "Founders who make decisions backed by analytics data grow 2.5x faster than those who rely on intuition alone. Knowing that 40% of visitors drop off on your pricing page tells you that a single copy change or a free-trial experiment could unlock tens of thousands in new ARR. Each data-informed improvement compounds: ten small changes made quarterly can double revenue within a year with no additional ad spend.",
    insightHighlight: "Data-informed founders grow 2.5x faster — your dashboard pays for itself.",
    reverseMockup: false,
  },
];

const MOCKUP_COMPONENTS = [
  <MockupSignup key="1" />,
  <MockupBook key="2" />,
  <MockupSEO key="3" />,
  <MockupStripe key="4" />,
  <MockupAdmin key="5" />,
];

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function HowItWorksPage() {
  return (
    <main>
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-[450px] w-[800px] rounded-full bg-[#FF6B61]/[0.06] blur-[150px]" />
        </div>
        <motion.div
          className="relative max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] text-white/60 text-sm rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B61] inline-block" />
            Five steps from idea to profitable business
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white leading-[1.08] mb-6">
            Your roadmap from{" "}
            <span className="bg-gradient-to-r from-[#FF6B61] via-[#ff9a8b] to-[#ffc5b9] bg-clip-text text-transparent">
              first visit
            </span>{" "}
            to growing revenue
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-12 leading-7">
            This is the exact path entrepreneurs take to go from &ldquo;I have an idea&rdquo; to a live
            full-stack business with real paying customers — step by step, with no technical
            background required.
          </p>

          {/* Step pills */}
          <div className="flex items-center justify-center gap-0 flex-wrap">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 ${s.categoryBg} ${s.categoryBorder}`}
                >
                  <span className={`text-[11px] font-bold ${s.categoryColor}`}>{s.num}</span>
                  <span className="text-[11px] text-white/50 hidden sm:inline">{s.category}</span>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className="w-6 h-px bg-white/[0.08] mx-1" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Steps ─────────────────────────────────────────────────────────── */}
      <section className="px-6 space-y-6 pb-6">
        {STEPS.map((step, idx) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl mx-auto"
          >
            <div className={`flex flex-col ${step.reverseMockup ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-16 items-center bg-white/[0.025] border border-white/[0.07] rounded-3xl p-8 md:p-12`}>
              
              {/* Text side */}
              <div className="flex-1 min-w-0">
                {/* Step number + category */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className={`text-6xl font-black bg-gradient-to-br ${step.numGradient} bg-clip-text text-transparent leading-none select-none`}
                  >
                    {step.num}
                  </span>
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${step.categoryBg} ${step.categoryBorder} ${step.categoryColor}`}>
                    {step.category}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-5">
                  {step.title}
                </h2>

                {/* Body */}
                <div className="space-y-4 mb-7">
                  {step.paragraphs.map((p, i) => (
                    <p key={i} className="text-white/55 leading-7 text-[15px]">{p}</p>
                  ))}
                </div>

                {/* Revenue insight callout */}
                <div className={`rounded-2xl border p-5 ${step.categoryBg} ${step.categoryBorder}`}>
                  <div className={`text-xs font-semibold tracking-widest uppercase mb-2 ${step.categoryColor}`}>
                    Revenue insight
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{step.insightHeadline}</h3>
                  <p className="text-sm text-white/50 leading-6 mb-3">{step.insightBody}</p>
                  <div className="flex items-start gap-2">
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${step.categoryColor}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    <p className={`text-sm font-semibold ${step.categoryColor}`}>
                      {step.insightHighlight}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mockup side */}
              <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0">
                <div className="relative">
                  {/* Ambient glow behind mockup */}
                  <div
                    className={`pointer-events-none absolute -inset-6 rounded-full blur-[60px] opacity-20 bg-gradient-to-br ${step.numGradient}`}
                  />
                  <div className="relative">
                    {MOCKUP_COMPONENTS[idx]}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Business outcomes ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">What you can achieve</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Real outcomes, not marketing promises
            </h2>
            <p className="text-white/45 max-w-xl mx-auto mt-4 leading-7">
              These numbers are built into the platform architecture — not theoretical projections.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                value: "3×",
                label: "Faster to your first paying customer",
                detail: "Entrepreneurs with a clear tech roadmap and pre-built integrations ship their first monetized product in weeks, not months of DIY trial and error.",
                color: "text-violet-400",
                bg: "bg-violet-400/[0.06] border-violet-400/15",
              },
              {
                value: "$17,400",
                label: "Annual recurring revenue from 50 subscribers",
                detail: "That is the ARR from a single $29/month tier with 50 customers — renewing automatically, every month, without a single additional sale.",
                color: "text-emerald-400",
                bg: "bg-emerald-400/[0.06] border-emerald-400/15",
              },
              {
                value: "24/7",
                label: "Lead generation through organic search",
                detail: "With perfect SEO scores and server-rendered pages, your website ranks, attracts, and converts visitors around the clock — even while you sleep.",
                color: "text-[#FF6B61]",
                bg: "bg-[#FF6B61]/[0.06] border-[#FF6B61]/15",
              },
            ].map((item, i) => (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`border rounded-2xl p-7 ${item.bg}`}
              >
                <div className={`text-5xl font-black tracking-tighter mb-3 ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-sm font-semibold text-white mb-3">{item.label}</div>
                <p className="text-sm text-white/45 leading-6">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-8 pb-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border border-[#FF6B61]/20 bg-gradient-to-br from-[#FF6B61]/10 via-[#ff9a8b]/5 to-transparent p-14 md:p-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[280px] w-[280px] rounded-full bg-[#FF6B61]/15 blur-[80px]" />
          </div>
          <div className="relative">
            <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">
              Ready to start?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Your five-step journey starts with one call.
            </h2>
            <p className="text-white/50 max-w-md mx-auto mb-8 leading-7">
              Book a free strategy session and walk away with a personalized roadmap,
              no commitment required. Most entrepreneurs leave with a launch plan on the
              same day they sign up.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block bg-[#FF6B61] hover:bg-[#ff5244] text-white py-3 px-8 rounded-full font-semibold text-sm transition-colors cursor-pointer"
                >
                  Book your free strategy call
                </motion.span>
              </Link>
              <Link href="/">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block bg-white/[0.07] border border-white/10 hover:bg-white/[0.1] text-white py-3 px-8 rounded-full font-semibold text-sm transition-colors cursor-pointer"
                >
                  Explore the platform →
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
