"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import MessageModal from "@/components/dashboard/MessageModal";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

/* Pipeline stage labels — index matches client.pipelineStage */
const STAGE_LABELS = [
  "Discovery Call",
  "Design Approval",
  "Development",
  "Testing & QA",
  "Launch",
  "Live & Growing",
];

/* Action items — shown unless the related flag is already complete */
const ALL_ACTIONS = [
  {
    key: "stripe",
    title: "Connect your Stripe account",
    detail: "Required to activate payments and subscriptions on your app.",
    priority: "high",
    href: "/dashboard/pipeline",
    hideWhen: (c: ClientData) => c.stripeOnboardingComplete,
  },
  {
    key: "domain",
    title: "Point your domain to your app",
    detail: "Share your domain or purchase one so we can configure DNS.",
    priority: "high",
    href: "/dashboard/pipeline",
    hideWhen: (c: ClientData) => !!c.customDomain,
  },
  {
    key: "copy",
    title: "Review your homepage copy",
    detail: "Confirm the headline, tagline, and service descriptions look right.",
    priority: "medium",
    href: "/dashboard/pipeline",
    hideWhen: () => false,
  },
  {
    key: "calendar",
    title: "Set your calendar availability",
    detail: "Tell us when you want customers to be able to book appointments.",
    priority: "medium",
    href: "/dashboard/calendar",
    hideWhen: () => false,
  },
];

const priorityCls: Record<string, string> = {
  high:   "text-[#FF6B61] bg-[#FF6B61]/10 border-[#FF6B61]/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const QUICK_LINKS = [
  { label: "View dev pipeline",  href: "/dashboard/pipeline",  color: "text-[#FF6B61]" },
  { label: "Browse my data",     href: "/dashboard/data",       color: "text-blue-400" },
  { label: "Analytics",          href: "/dashboard/analytics",  color: "text-emerald-400" },
  { label: "Manage calendar",    href: "/dashboard/calendar",   color: "text-violet-400" },
];

interface ClientData {
  name: string;
  plan: string;
  status: string;
  pipelineStage: number;
  stripeOnboardingComplete: boolean;
  stripeAccountId?: string;
  customDomain?: string;
}

interface StatsData {
  bookings: { confirmed: number; pending: number; total: number };
  revenue: { mrr: number };
  users: { total: number };
  pageViews: { total: number };
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [msgOpen, setMsgOpen] = useState(false);
  const [client, setClient] = useState<ClientData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [subscriptionBanner, setSubscriptionBanner] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const subscribed = searchParams.get("subscribed");
    const planParam = searchParams.get("plan");

    if (subscribed === "1" && sessionId) {
      // Verify checkout and update plan immediately (don't wait for webhook)
      fetch(`/api/stripe/verify-checkout?session_id=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.plan) {
            setSubscriptionBanner(data.plan);
            // Refetch client so all plan-aware UI reflects the change
            fetch("/api/clients/me").then((r) => r.json()).then(setClient).catch(() => null);
          }
        })
        .catch(() => null);
      // Clean up URL without reloading the page
      router.replace("/dashboard");
    } else if (subscribed === "1" && planParam) {
      // Fallback: no session_id but subscribed flag present
      setSubscriptionBanner(planParam.charAt(0).toUpperCase() + planParam.slice(1));
      fetch("/api/clients/me").then((r) => r.json()).then(setClient).catch(() => null);
      router.replace("/dashboard");
    } else {
      fetch("/api/clients/me").then((r) => r.json()).then(setClient).catch(() => null);
    }

    fetch("/api/me/stats").then((r) => r.json()).then(setStats).catch(() => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageIdx = client?.pipelineStage ?? 2;
  const stages = STAGE_LABELS.map((label, i) => ({
    label,
    status: i < stageIdx ? "done" : i === stageIdx ? "active" : "pending",
  }));

  const actions = client
    ? ALL_ACTIONS.filter((a) => !a.hideWhen(client))
    : ALL_ACTIONS;

  const quickStats = [
    {
      label: "Page views",
      value: stats ? stats.pageViews.total.toLocaleString() : "—",
      note: stats ? "All time" : "Loading…",
      color: "text-blue-400",
    },
    {
      label: "Revenue (MRR)",
      value: stats ? (stats.revenue.mrr > 0 ? `$${stats.revenue.mrr.toLocaleString()}` : "—") : "—",
      note: stats ? (stats.revenue.mrr > 0 ? "This month" : "After Stripe connect") : "Loading…",
      color: "text-emerald-400",
    },
    {
      label: "Active users",
      value: stats ? stats.users.total.toLocaleString() : "—",
      note: stats ? (stats.users.total > 0 ? "In your app" : "Available at launch") : "Loading…",
      color: "text-violet-400",
    },
    {
      label: "Bookings",
      value: stats ? stats.bookings.confirmed.toString() : "—",
      note: stats ? `${stats.bookings.pending} pending` : "Loading…",
      color: "text-[#FF6B61]",
    },
  ];

  return (
    <div className="px-8 py-8 max-w-6xl">
      <MessageModal open={msgOpen} onClose={() => setMsgOpen(false)} />

      {/* Subscription success banner */}
      <AnimatePresence>
        {subscriptionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl px-5 py-4"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400 font-medium">
              You&apos;re now on the <span className="font-semibold">{subscriptionBanner}</span> plan — welcome!
            </p>
            <button
              onClick={() => setSubscriptionBanner(null)}
              className="ml-auto text-emerald-400/50 hover:text-emerald-400 transition-colors text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-xl font-semibold text-white">
          {client ? `Welcome back, ${client.name.split(" ")[0]} 👋` : "Welcome back 👋"}
        </h1>
        <p className="text-sm text-white/40 mt-0.5">{today}</p>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={fade(0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {quickStats.map((s) => (
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
                  Currently in stage {stageIdx + 1} of {stages.length} — {STAGE_LABELS[stageIdx]}
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
              {stages.map((stage, i) => (
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
                  {i < stages.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        i < stageIdx ? "bg-emerald-400/60" : "bg-white/6"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {stages.map((stage) => (
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
                {actions.filter((a) => a.priority === "high").length} urgent
              </span>
            </div>
            <div className="space-y-3">
              {actions.map((action) => (
                <Link key={action.key} href={action.href}>
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

          {/* Plan badge */}
          {client && (
            <motion.div
              variants={fade(0.2)}
              initial="hidden"
              animate="visible"
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <span className="text-xs font-semibold text-white/60">Your plan</span>
                <span className="ml-auto text-xs font-semibold text-blue-400">{client.plan}</span>
              </div>
              <p className="text-xs text-white/35 leading-5">
                Status: <span className="text-white/60 capitalize">{client.status}</span>
              </p>
              <Link href="/dashboard/data" className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-3 block font-medium">
                Browse your data →
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
