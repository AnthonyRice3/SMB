"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import MessageModal from "@/components/dashboard/MessageModal";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

/* Pipeline stages — matches pipeline page */
const STAGES = [
  { label: "Discovery Call",     status: "done" },
  { label: "Design Approval",    status: "done" },
  { label: "Development",        status: "active" },
  { label: "Testing & QA",       status: "pending" },
  { label: "Launch",             status: "pending" },
  { label: "Live & Growing",     status: "pending" },
];

/* Action items with urgency */
const ACTIONS = [
  {
    title: "Connect your Stripe account",
    detail: "Required to activate payments and subscriptions on your app.",
    priority: "high",
    href: "/dashboard/pipeline",
  },
  {
    title: "Point your domain to your app",
    detail: "Share your domain or purchase one so we can configure DNS.",
    priority: "high",
    href: "/dashboard/pipeline",
  },
  {
    title: "Review your homepage copy",
    detail: "Confirm the headline, tagline, and service descriptions look right.",
    priority: "medium",
    href: "/dashboard/pipeline",
  },
  {
    title: "Set your calendar availability",
    detail: "Tell us when you want customers to be able to book appointments.",
    priority: "medium",
    href: "/dashboard/calendar",
  },
];

const priorityCls: Record<string, string> = {
  high:   "text-[#FF6B61] bg-[#FF6B61]/10 border-[#FF6B61]/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low:    "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

const QUICK_STATS = [
  { label: "Page views",     value: "—",     note: "Available at launch",  color: "text-blue-400" },
  { label: "Revenue (MRR)",  value: "—",     note: "After Stripe connect",  color: "text-emerald-400" },
  { label: "Active users",   value: "—",     note: "Available at launch",  color: "text-violet-400" },
  { label: "Bookings",       value: "0",     note: "Set availability first", color: "text-[#FF6B61]" },
];

const QUICK_LINKS = [
  { label: "View dev pipeline",  href: "/dashboard/pipeline",  color: "text-[#FF6B61]" },
  { label: "Browse my data",     href: "/dashboard/data",       color: "text-blue-400" },
  { label: "Analytics",          href: "/dashboard/analytics",  color: "text-emerald-400" },
  { label: "Manage calendar",    href: "/dashboard/calendar",   color: "text-violet-400" },
];

export default function DashboardPage() {
  const [msgOpen, setMsgOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const activeIdx = STAGES.findIndex((s) => s.status === "active");

  return (
    <div className="px-8 py-8 max-w-6xl">
      <MessageModal open={msgOpen} onClose={() => setMsgOpen(false)} />
      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-xl font-semibold text-white">Welcome back 👋</h1>
        <p className="text-sm text-white/40 mt-0.5">{today}</p>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={fade(0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {QUICK_STATS.map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/7 rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-[11px] text-white/25">{s.note}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: pipeline + actions */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pipeline snapshot */}
          <motion.div
            variants={fade(0.1)}
            initial="hidden"
            animate="visible"
            className="bg-white/3 border border-white/7 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Development Pipeline</h2>
                <p className="text-xs text-white/35 mt-0.5">
                  Currently in stage {activeIdx + 1} of {STAGES.length} — {STAGES[activeIdx]?.label}
                </p>
              </div>
              <Link
                href="/dashboard/pipeline"
                className="text-xs text-[#FF6B61] hover:text-[#ff9a8b] transition-colors font-medium"
              >
                Full details →
              </Link>
            </div>

            {/* Progress track */}
            <div className="relative flex items-center gap-0 mb-2">
              {STAGES.map((stage, i) => (
                <div key={stage.label} className="flex items-center flex-1 last:flex-none">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                        stage.status === "done"
                          ? "bg-emerald-400 border-emerald-400 text-white"
                          : stage.status === "active"
                          ? "bg-[#FF6B61] border-[#FF6B61] text-white ring-4 ring-[#FF6B61]/20"
                          : "bg-transparent border-white/15 text-white/20"
                      }`}
                    >
                      {stage.status === "done" ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        i < activeIdx ? "bg-emerald-400/60" : "bg-white/6"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {STAGES.map((stage) => (
                <div key={stage.label} className="flex-1 text-center">
                  <p
                    className={`text-[9px] leading-tight ${
                      stage.status === "active"
                        ? "text-[#FF6B61] font-semibold"
                        : stage.status === "done"
                        ? "text-emerald-400/70"
                        : "text-white/20"
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action items */}
          <motion.div
            variants={fade(0.15)}
            initial="hidden"
            animate="visible"
            className="bg-white/3 border border-white/7 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Your action items</h2>
                <p className="text-xs text-white/35 mt-0.5">Complete these to move your project forward</p>
              </div>
              <span className="text-xs bg-[#FF6B61]/15 text-[#FF6B61] font-semibold px-2.5 py-1 rounded-full border border-[#FF6B61]/20">
                {ACTIONS.filter((a) => a.priority === "high").length} urgent
              </span>
            </div>
            <div className="space-y-3">
              {ACTIONS.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className="flex items-start gap-4 p-4 bg-white/2 border border-white/6 rounded-xl hover:border-white/12 hover:bg-white/4 transition-all cursor-pointer group">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        action.priority === "high" ? "bg-[#FF6B61]" : "bg-amber-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-white/90">{action.title}</p>
                      <p className="text-xs text-white/35 mt-0.5">{action.detail}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${priorityCls[action.priority]}`}>
                      {action.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column: quick links + recent activity */}
        <div className="space-y-6">
          {/* Quick links */}
          <motion.div
            variants={fade(0.12)}
            initial="hidden"
            animate="visible"
            className="bg-white/3 border border-white/7 rounded-2xl p-5"
          >
            <h2 className="text-sm font-semibold text-white mb-4">Quick navigation</h2>
            <div className="space-y-1">
              {QUICK_LINKS.map(({ label, href, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <span className={`text-sm font-medium ${color}`}>{label}</span>
                  <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Message your dev */}
          <motion.div
            variants={fade(0.18)}
            initial="hidden"
            animate="visible"
            className="bg-[#FF6B61]/6 border border-[#FF6B61]/20 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#FF6B61]/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#FF6B61]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Have a question?</p>
                <p className="text-xs text-white/40 mt-0.5">Anthony usually replies within a few hours.</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMsgOpen(true)}
              className="w-full text-center bg-[#FF6B61] hover:bg-[#ff5244] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Send a message
            </motion.button>
          </motion.div>

          {/* DB status card */}
          <motion.div
            variants={fade(0.22)}
            initial="hidden"
            animate="visible"
            className="bg-white/2 border border-white/6 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              <span className="text-xs font-semibold text-white/60">Database</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Pending setup
              </span>
            </div>
            <p className="text-xs text-white/35 leading-5">
              Your personal MongoDB collection will be provisioned when database connection is configured.
              Your data will be accessible here.
            </p>
            <Link href="/dashboard/data" className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-3 block font-medium">
              Preview data structure →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
