"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

/* ─── Dev stages (config only — status derived from DB) ──────────────────── */
const STAGE_CONFIG = [
  {
    num: "01",
    label: "Discovery Call",
    date: "Mar 28, 2026",
    summary: "Scope, goals, and tech stack confirmed. Requirements documented.",
    tasks: [
      { task: "Business goals documented", done: true },
      { task: "Tech stack selected (Next.js, MongoDB, Stripe, Clerk)", done: true },
      { task: "Feature list finalized", done: true },
      { task: "Timeline agreed upon", done: true },
    ],
  },
  {
    num: "02",
    label: "Design Approval",
    date: "Apr 1, 2026",
    summary: "Brand identity, color palette, and page layouts approved.",
    tasks: [
      { task: "Color palette and typography selected", done: true },
      { task: "Homepage wireframe approved", done: true },
      { task: "Dashboard layout reviewed", done: true },
      { task: "Mobile responsiveness confirmed", done: true },
    ],
  },
  {
    num: "03",
    label: "Development",
    date: "In progress",
    summary: "Core platform and all pages are being built. Integrations being wired.",
    tasks: [
      { task: "Public pages (landing, how-it-works, about, contact)", done: true },
      { task: "User dashboard (this page!)", done: true },
      { task: "Authentication pages (Clerk)", done: false },
      { task: "Stripe Connect integration", done: false },
      { task: "MongoDB Atlas collection setup", done: false },
      { task: "Email automation (Resend)", done: false },
    ],
  },
  {
    num: "04",
    label: "Testing & QA",
    date: "Upcoming",
    summary: "End-to-end testing, mobile QA, performance audit, and security review.",
    tasks: [
      { task: "Cross-browser and mobile testing", done: false },
      { task: "Lighthouse performance audit (target: 95+)", done: false },
      { task: "Payment flow end-to-end test", done: false },
      { task: "Auth edge-case review", done: false },
      { task: "Security scan (OWASP)", done: false },
    ],
  },
  {
    num: "05",
    label: "Launch",
    date: "Upcoming",
    summary: "Domain configuration, SSL, final deployment, and go-live handoff.",
    tasks: [
      { task: "Domain DNS pointed to app", done: false },
      { task: "SSL certificate provisioned", done: false },
      { task: "Production environment deployed", done: false },
      { task: "Handoff documentation delivered", done: false },
    ],
  },
  {
    num: "06",
    label: "Live & Growing",
    date: "Your goal",
    summary: "Platform is live. Real users, real revenue, real analytics.",
    tasks: [
      { task: "First user signup", done: false },
      { task: "First Stripe payment processed", done: false },
      { task: "Analytics dashboard active", done: false },
      { task: "Ongoing support & iteration", done: false },
    ],
  },
];

/* ─── User action items ──────────────────────────────────── */
const USER_STEPS = [
  {
    id: "stripe",
    priority: "high" as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Connect your Stripe account",
    why: "Stripe Connect links your bank account to your app so payments from your customers flow directly to you. Without it, the checkout on your site will not process transactions.",
    steps: [
      "Go to stripe.com and create a free account (takes ~5 minutes)",
      "Complete identity verification (required by card networks)",
      "Share your Stripe publishable and secret API keys with your developer",
      "Your developer will wire the keys and test a $1 payment end-to-end",
    ],
    color: "text-[#FF6B61]",
    bg: "bg-[#FF6B61]/[0.06] border-[#FF6B61]/20",
    badgeBg: "bg-[#FF6B61]/10 text-[#FF6B61] border-[#FF6B61]/20",
  },
  {
    id: "domain",
    priority: "high" as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Provide your custom domain",
    why: "Your app will launch at a .vercel.app URL by default. To use your own domain (e.g. yourbusiness.com) you'll need to either purchase one or point an existing one to the app servers.",
    steps: [
      "Purchase a domain from Namecheap, GoDaddy, or Google Domains (~$12/year)",
      "Or share login access to your registrar if you already own a domain",
      "Your developer will configure DNS records and provision your free SSL certificate",
      "Your site will be live at your custom URL within 24–48 hours of DNS propagation",
    ],
    color: "text-blue-400",
    bg: "bg-blue-400/[0.06] border-blue-400/20",
    badgeBg: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  },
  {
    id: "copy",
    priority: "medium" as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Review and approve your website copy",
    why: "The words on your site are what converts a visitor into a paying customer. Placeholder copy ships with the app; your real service descriptions, pricing, and about-you text need to be confirmed before launch.",
    steps: [
      "Review the homepage headline, subheadline, and feature descriptions",
      "Confirm your services and pricing tiers are accurately represented",
      "Write a short bio for the About section (2–4 sentences is fine)",
      "Send any edits or approvals via the message form or email",
    ],
    color: "text-emerald-400",
    bg: "bg-emerald-400/[0.06] border-emerald-400/20",
    badgeBg: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  },
  {
    id: "calendar",
    priority: "medium" as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Set your booking availability",
    why: "Your app has a built-in appointment booking system. Customers can only book times you've marked as available — so without configuring your schedule, no one can book.",
    steps: [
      "Go to the Calendar page in this dashboard",
      "Select your available days and hours",
      "Choose session durations (30 min or 60 min)",
      "Set a buffer time between appointments if needed",
    ],
    color: "text-violet-400",
    bg: "bg-violet-400/[0.06] border-violet-400/20",
    badgeBg: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  },
];

const priorityLabel: Record<string, string> = {
  high: "High priority",
  medium: "Medium priority",
};

export default function PipelinePage() {
  const [expanded, setExpanded] = useState<string | null>("03");
  const [expandedStep, setExpandedStep] = useState<string | null>("stripe");
  const [pipelineStage, setPipelineStage] = useState(2);
  const [stripeComplete, setStripeComplete] = useState(false);
  const [hasCustomDomain, setHasCustomDomain] = useState(false);

  useEffect(() => {
    fetch("/api/clients/me")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.pipelineStage === "number") setPipelineStage(data.pipelineStage);
        if (data.stripeOnboardingComplete) setStripeComplete(true);
        if (data.customDomain) setHasCustomDomain(true);
      })
      .catch(() => null);
  }, []);

  // Derive stage statuses from DB value
  type StageStatus = "done" | "active" | "pending";
  const STAGES = STAGE_CONFIG.map((s, i) => ({
    ...s,
    status: (i < pipelineStage ? "done" : i === pipelineStage ? "active" : "pending") as StageStatus,
  }));

  const activeIdx = pipelineStage;
  const doneCount = pipelineStage;

  // Filter USER_STEPS based on what client has already completed
  const visibleSteps = USER_STEPS.filter((s) => {
    if (s.id === "stripe" && stripeComplete) return false;
    if (s.id === "domain" && hasCustomDomain) return false;
    return true;
  });

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-2">
        <h1 className="text-xl font-semibold text-white">Development Pipeline</h1>
        <p className="text-sm text-white/40 mt-1">
          Stage {activeIdx + 1} of {STAGES.length} — {STAGES[activeIdx]?.label} is in progress.{" "}
          {doneCount} of {STAGES.length} stages complete.
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        variants={fade(0.05)}
        initial="hidden"
        animate="visible"
        className="my-6"
      >
        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-linear-to-r from-[#FF6B61] to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((doneCount + 0.5) / STAGES.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-white/30">Project start</span>
          <span className="text-[11px] text-[#FF6B61] font-medium">{Math.round(((doneCount + 0.5) / STAGES.length) * 100)}% complete</span>
          <span className="text-[11px] text-white/30">Live & growing</span>
        </div>
      </motion.div>

      {/* Stage cards */}
      <motion.div
        variants={fade(0.1)}
        initial="hidden"
        animate="visible"
        className="space-y-3 mb-12"
      >
        {STAGES.map((stage) => {
          const isExpanded = expanded === stage.num;
          const doneTaskCount = stage.tasks.filter((t) => t.done).length;
          return (
            <div
              key={stage.num}
              className={`border rounded-2xl overflow-hidden transition-colors ${
                stage.status === "active"
                  ? "border-[#FF6B61]/30 bg-[#FF6B61]/4"
                  : stage.status === "done"
                  ? "border-emerald-400/20 bg-emerald-400/3"
                  : "border-white/6 bg-white/2"
              }`}
            >
              <button
                className="w-full text-left px-5 py-4"
                onClick={() => setExpanded(isExpanded ? null : stage.num)}
              >
                <div className="flex items-center gap-4">
                  {/* Status dot */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      stage.status === "done"
                        ? "bg-emerald-400/20 text-emerald-400"
                        : stage.status === "active"
                        ? "bg-[#FF6B61]/20 text-[#FF6B61]"
                        : "bg-white/4 text-white/20"
                    }`}
                  >
                    {stage.status === "done" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      stage.num
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{stage.label}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          stage.status === "done"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : stage.status === "active"
                            ? "bg-[#FF6B61]/10 text-[#FF6B61] animate-pulse"
                            : "bg-white/4 text-white/25"
                        }`}
                      >
                        {stage.status === "done" ? "Complete" : stage.status === "active" ? "In progress" : "Upcoming"}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5">{stage.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/40">{doneTaskCount}/{stage.tasks.length} tasks</p>
                    <svg
                      className={`w-4 h-4 text-white/20 ml-auto mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {!isExpanded && (
                  <p className="text-xs text-white/35 mt-2 ml-12">{stage.summary}</p>
                )}
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 ml-12">
                      <p className="text-sm text-white/50 mb-4 leading-6">{stage.summary}</p>
                      <div className="space-y-2">
                        {stage.tasks.map((t) => (
                          <div key={t.task} className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                t.done ? "bg-emerald-400/20" : "border border-white/12 bg-transparent"
                              }`}
                            >
                              {t.done && (
                                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm ${t.done ? "text-white/50 line-through" : "text-white/70"}`}>
                              {t.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>

      {/* User action items */}
      <motion.div variants={fade(0.2)} initial="hidden" animate="visible">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Your action items</h2>
          <p className="text-sm text-white/40 mt-1">
            These are things only you can complete — they are blocking your launch.
          </p>
        </div>

        <div className="space-y-4">
          {visibleSteps.map((step) => {
            const isExpanded = expandedStep === step.id;
            return (
              <div key={step.id} className={`border rounded-2xl overflow-hidden ${step.bg}`}>
                <button
                  className="w-full text-left px-5 py-4"
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`shrink-0 ${step.color}`}>{step.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${step.badgeBg}`}>
                        {priorityLabel[step.priority]}
                      </span>
                      <svg
                        className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/6">
                        <p className="text-sm text-white/55 leading-6 my-4">{step.why}</p>
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Steps to complete</p>
                        <div className="space-y-2.5">
                          {step.steps.map((s, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.color} bg-white/5`}>
                                {i + 1}
                              </span>
                              <p className="text-sm text-white/60">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
