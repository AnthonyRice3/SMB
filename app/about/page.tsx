"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

const CERTS = [
  {
    label: "CompTIA Security+",
    sub: "Cybersecurity",
    color: "text-red-400",
    bg: "bg-red-400/[0.08] border-red-400/20",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "B.S. Computer Science",
    sub: "Software Engineering",
    color: "text-blue-400",
    bg: "bg-blue-400/[0.08] border-blue-400/20",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    label: "Full-Stack Development",
    sub: "Next.js · TypeScript · Node",
    color: "text-emerald-400",
    bg: "bg-emerald-400/[0.08] border-emerald-400/20",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: "Systems Architecture",
    sub: "Distributed · Cloud · APIs",
    color: "text-violet-400",
    bg: "bg-violet-400/[0.08] border-violet-400/20",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
];

const PROBLEM_ITEMS = [
  {
    cost: "$23/mo",
    name: "Website builder",
    note: "No custom logic, limited SEO",
    color: "text-red-400",
  },
  {
    cost: "$35/mo",
    name: "Auth provider",
    note: "Separate dashboard, separate billing",
    color: "text-red-400",
  },
  {
    cost: "$50/mo",
    name: "Email platform",
    note: "No integration with your data",
    color: "text-red-400",
  },
  {
    cost: "$49/mo",
    name: "Analytics tool",
    note: "Generic data, not business-specific",
    color: "text-red-400",
  },
  {
    cost: "$30/mo",
    name: "Appointment scheduler",
    note: "Yet another login, yet another tab",
    color: "text-red-400",
  },
];

const VALUES = [
  {
    title: "Transparency over lock-in",
    body: "Everything built on SAGAH is yours. Open standards, portable code, no proprietary traps. If you ever want to take your codebase elsewhere, you can — because it was written for you, not for us.",
    color: "text-[#FF6B61]",
    bg: "bg-[#FF6B61]/[0.06] border-[#FF6B61]/15",
  },
  {
    title: "Security is non-negotiable",
    body: "A background in cybersecurity means every feature — authentication flows, API design, data storage, and payment handling — is built with a security-first mindset. OWASP Top 10, secure defaults, and least-privilege access are built into the architecture, not added as an afterthought.",
    color: "text-violet-400",
    bg: "bg-violet-400/[0.06] border-violet-400/15",
  },
  {
    title: "Entrepreneurs deserve enterprise-grade tools",
    body: "The technology stack powering Fortune 500 companies shouldn't be gated behind a $200k engineering hire. The same infrastructure patterns used by high-growth startups — edge rendering, webhook-driven automation, real-time analytics — are what every SMB owner deserves from day one.",
    color: "text-blue-400",
    bg: "bg-blue-400/[0.06] border-blue-400/15",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function AboutPage() {
  return (
    <main>
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-[500px] w-[700px] rounded-full bg-[#FF6B61]/[0.06] blur-[140px]" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-14 items-center">

            {/* Text */}
            <motion.div
              className="flex-1"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] text-white/60 text-sm rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B61] inline-block" />
                The person behind the platform
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white leading-[1.08] mb-6">
                Built by an engineer
                <br />
                <span className="bg-gradient-to-r from-[#FF6B61] via-[#ff9a8b] to-[#ffc5b9] bg-clip-text text-transparent">
                  for entrepreneurs.
                </span>
              </h1>

              <p className="text-lg text-white/55 leading-8 mb-6 max-w-lg">
                I&apos;m a computer scientist, full-stack software engineer, and CompTIA-certified
                cybersecurity professional. I built SAGAH because I watched too many talented
                entrepreneurs spend more time managing disconnected SaaS subscriptions than building
                their actual businesses.
              </p>

              <p className="text-[15px] text-white/40 leading-7 max-w-lg mb-10">
                The idea is simple: every backend process a small business needs — payments, auth,
                email, analytics, scheduling, and SEO — should live on one platform that you own,
                at a fraction of what you&apos;d pay stitching together five separate tools.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://ariii.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-white text-[#07070e] py-2.5 px-5 rounded-full font-semibold text-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    ariii.dev
                    <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </motion.span>
                </a>
                <Link href="/contact">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 hover:bg-white/[0.1] text-white py-2.5 px-5 rounded-full font-semibold text-sm cursor-pointer transition-colors"
                  >
                    Book a strategy call
                  </motion.span>
                </Link>
              </div>
            </motion.div>

            {/* Avatar / identity card */}
            <motion.div
              className="w-full lg:w-[340px] flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                <div className="pointer-events-none absolute -inset-8 rounded-full bg-[#FF6B61]/[0.07] blur-[60px]" />
                <div className="relative bg-[#0a0a15] border border-white/[0.08] rounded-3xl p-7">
                  {/* Avatar placeholder */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B61] to-[#ff9a8b] flex items-center justify-center mb-5">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>

                  <div className="mb-1">
                    <h3 className="text-lg font-bold text-white">Anthony Rice</h3>
                    <p className="text-sm text-white/40">Founder · SAGAH</p>
                  </div>

                  <a
                    href="https://ariii.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#FF6B61] text-xs font-medium mt-1 mb-5 hover:text-[#ff9a8b] transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    ariii.dev
                  </a>

                  <div className="space-y-2.5">
                    {CERTS.map((c) => (
                      <div key={c.label} className={`flex items-center gap-3 rounded-xl border p-3 ${c.bg}`}>
                        <span className={c.color}>{c.icon}</span>
                        <div>
                          <div className={`text-xs font-semibold ${c.color}`}>{c.label}</div>
                          <div className="text-[10px] text-white/30">{c.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── The Problem ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">The problem I set out to solve</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Entrepreneurs are over-paying for fragmented tools
            </h2>
            <p className="text-white/45 max-w-2xl mx-auto leading-7">
              Most small business owners don&apos;t need five separate subscriptions. They need one
              integrated platform that handles each backend process without the overhead,
              the context-switching, or the inflated pricing.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Before: fragmented */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white/60">The old way — fragmented</span>
              </div>
              <div className="space-y-3">
                {PROBLEM_ITEMS.map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <span className="text-sm font-bold text-red-400 w-14 flex-shrink-0 pt-0.5">{item.cost}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-white/30">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.07] flex justify-between items-center">
                <span className="text-xs text-white/30">Total per month</span>
                <span className="text-lg font-black text-red-400">$187 / mo</span>
              </div>
              <div className="mt-1 text-right text-xs text-white/20">$2,244 / year — before dev time</div>
            </motion.div>

            {/* After: SAGAH */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#FF6B61]/[0.05] border border-[#FF6B61]/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white/70">The SAGAH way — consolidated</span>
              </div>
              <div className="space-y-3">
                {[
                  "Full-stack website with server-side rendering",
                  "Authentication (Clerk) — built in, not bolted on",
                  "Stripe payments, subscriptions, and webhooks",
                  "Transactional email (Resend) — automated",
                  "Business analytics dashboard — real time",
                  "Demo scheduling + inquiry management",
                  "Production SEO — Lighthouse 100 out of the box",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-[#FF6B61]/20 flex justify-between items-center">
                <span className="text-xs text-white/30">One platform, everything included</span>
                <span className="text-lg font-black text-[#FF6B61]">One plan</span>
              </div>
              <div className="mt-1 text-right text-xs text-white/30">Custom-built · owned by you · no lock-in</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Background & Expertise ────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">Background</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              What I bring to every project
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                ),
                color: "text-blue-400",
                bg: "bg-blue-400/[0.08] border-blue-400/20",
                title: "Computer Scientist",
                body: "A formal foundation in algorithms, data structures, systems design, and computational theory. Every architecture decision is backed by first-principles understanding of how software actually works at scale.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                ),
                color: "text-emerald-400",
                bg: "bg-emerald-400/[0.08] border-emerald-400/20",
                title: "Software Engineer",
                body: "Production-grade full-stack development across Next.js, TypeScript, Node, MongoDB, and REST / webhook APIs. I write code that ships, scales, and can be handed off — not prototypes that collapse under real traffic.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                color: "text-red-400",
                bg: "bg-red-400/[0.08] border-red-400/20",
                title: "CompTIA Certified Cybersecurity Professional",
                body: "CompTIA Security+ certified with a practical focus on secure-by-default development. Authentication, authorization, input validation, API security, and payment data handling are all treated as first-class engineering concerns, not compliance checkboxes.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`border rounded-2xl p-6 ${item.bg}`}
              >
                <div className={`mb-4 ${item.color}`}>{item.icon}</div>
                <h3 className="text-sm font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-white/50 leading-6">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">What guides the work</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Principles, not platitudes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`border rounded-2xl p-7 ${v.bg}`}
              >
                <h3 className={`text-base font-bold mb-3 ${v.color}`}>{v.title}</h3>
                <p className="text-sm text-white/55 leading-7">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personal site CTA ─────────────────────────────────────────────── */}
      <section className="py-8 pb-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 md:p-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[260px] w-[260px] rounded-full bg-[#FF6B61]/[0.08] blur-[80px]" />
          </div>
          <div className="relative">
            <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">
              Want to know more?
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              See the full portfolio at{" "}
              <a
                href="https://ariii.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-[#FF6B61] to-[#ff9a8b] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                ariii.dev
              </a>
            </h2>
            <p className="text-white/45 max-w-md mx-auto mb-8 leading-7">
              Projects, case studies, and the engineering thinking behind the work.
              Or book a call directly and we can talk through your specific use case.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://ariii.dev" target="_blank" rel="noopener noreferrer">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white text-[#07070e] py-3 px-7 rounded-full font-semibold text-sm cursor-pointer"
                >
                  Visit ariii.dev
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </motion.span>
              </a>
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 hover:bg-white/[0.1] text-white py-3 px-7 rounded-full font-semibold text-sm transition-colors cursor-pointer"
                >
                  Book a strategy call
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
