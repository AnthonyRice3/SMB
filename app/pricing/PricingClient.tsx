"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type Interval = "month" | "year";
type PlanId = "free" | "starter" | "growth" | "pro";

interface Plan {
  id: PlanId;
  name: string;
  desc: string;
  monthlyPrice: number | null; // null = free
  annualMonthlyPrice: number | null; // price per month when billed annually
  annualTotal: number | null; // total charged per year
  fee: string;
  feeNote: string;
  color: string; // accent colour class
  highlight: boolean; // "most popular"
  features: string[];
  cta: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    desc: "Everything you need to launch your first client app.",
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    annualTotal: 0,
    fee: "15%",
    feeNote: "platform fee per transaction",
    color: "text-white/60",
    highlight: false,
    cta: "Get started free",
    features: [
      "1 client app",
      "Up to 25 end-users",
      "Stripe Connect integration",
      "Booking & scheduling",
      "15% transaction fee",
      "Basic analytics",
      "Community support",
      "API access",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    desc: "For growing businesses ready to scale their user base.",
    monthlyPrice: 10,
    annualMonthlyPrice: 7.5,
    annualTotal: 90,
    fee: "10%",
    feeNote: "platform fee per transaction",
    color: "text-violet-400",
    highlight: false,
    cta: "Start with Starter",
    features: [
      "Up to 3 client apps",
      "Up to 250 end-users",
      "Stripe Connect integration",
      "Booking & scheduling",
      "10% transaction fee",
      "Analytics dashboard",
      "Email support",
      "API access",
      "Custom booking flows",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    desc: "The sweet spot for high-volume businesses.",
    monthlyPrice: 20,
    annualMonthlyPrice: 15,
    annualTotal: 180,
    fee: "5%",
    feeNote: "covers payment processing only",
    color: "text-[#FF6B61]",
    highlight: true,
    cta: "Start with Growth",
    features: [
      "Up to 10 client apps",
      "Up to 1,000 end-users",
      "Stripe Connect integration",
      "Booking & scheduling",
      "5% transaction fee",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom booking flows",
      "Custom domain",
      "Transactional emails",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    desc: "For agencies and power users who want zero friction.",
    monthlyPrice: 35,
    annualMonthlyPrice: 26.25,
    annualTotal: 315,
    fee: "0%",
    feeNote: "no transaction fees at all",
    color: "text-amber-400",
    highlight: false,
    cta: "Go Pro",
    features: [
      "Unlimited client apps",
      "Unlimited end-users",
      "Stripe Connect integration",
      "Booking & scheduling",
      "0% transaction fee",
      "Full analytics suite",
      "Dedicated support",
      "API access",
      "Custom booking flows",
      "Custom domain",
      "Transactional emails",
      "White-label branding",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingClient() {
  const [interval, setInterval] = useState<Interval>("month");
  const [loading, setLoading] = useState<PlanId | null>(null);
  const router = useRouter();

  async function handleCTA(plan: Plan) {
    if (plan.id === "free") {
      router.push("/sign-up");
      return;
    }

    // Auth not configured — redirect to sign-in
    router.push("/sign-in");

    setLoading(plan.id);
    try {
      const res = await fetch("/api/stripe/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        console.error("[pricing] checkout error", data);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("[pricing] network error", err);
    } finally {
      setLoading(null);
    }
  }

  const savings = "Save 25% with annual billing";

  return (
    <main className="min-h-screen bg-[#07070e] pt-24 pb-32 px-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 flex justify-center overflow-hidden">
        <div className="-mt-24 h-[600px] w-[800px] rounded-full bg-[#FF6B61]/[0.05] blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold text-[#FF6B61] uppercase tracking-widest mb-4"
          >
            Pricing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            Simple, transparent pricing.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            Start free. Scale as your clients grow. Only pay for what you use.
          </motion.p>
        </div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium transition-colors ${interval === "month" ? "text-white" : "text-white/35"}`}>
            Monthly
          </span>
          <button
            onClick={() => setInterval((v) => (v === "month" ? "year" : "month"))}
            className="relative w-12 h-6 rounded-full bg-white/10 border border-white/10 transition-colors focus:outline-none"
            aria-label="Toggle billing interval"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#FF6B61] shadow transition-transform duration-200 ${
                interval === "year" ? "translate-x-6" : ""
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${interval === "year" ? "text-white" : "text-white/35"}`}>
            Annual
          </span>
          <AnimatePresence>
            {interval === "year" && (
              <motion.span
                key="badge"
                initial={{ opacity: 0, scale: 0.8, x: -4 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full"
              >
                {savings}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              interval={interval}
              loading={loading === plan.id}
              onCTA={() => handleCTA(plan)}
              delay={0.2 + i * 0.06}
            />
          ))}
        </div>

        {/* Fee comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20"
        >
          <h2 className="text-center text-white text-xl font-bold mb-8">
            Transaction fee comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="text-left px-6 py-4 text-white/40 font-medium">Plan</th>
                  <th className="text-center px-6 py-4 text-white/40 font-medium">SAGAH fee</th>
                  <th className="text-center px-6 py-4 text-white/40 font-medium">$1,000 processed</th>
                  <th className="text-center px-6 py-4 text-white/40 font-medium">$10,000 processed</th>
                  <th className="text-center px-6 py-4 text-white/40 font-medium">$50,000 processed</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Free", fee: 0.15, color: "text-white/60" },
                  { name: "Starter", fee: 0.10, color: "text-violet-400" },
                  { name: "Growth", fee: 0.05, color: "text-[#FF6B61]" },
                  { name: "Pro", fee: 0, color: "text-amber-400" },
                ].map((row, idx) => (
                  <tr
                    key={row.name}
                    className={`border-b border-white/[0.04] last:border-b-0 ${idx % 2 === 0 ? "" : "bg-white/[0.015]"}`}
                  >
                    <td className={`px-6 py-4 font-semibold ${row.color}`}>{row.name}</td>
                    <td className="px-6 py-4 text-center text-white/70">
                      {row.fee === 0 ? <span className="text-emerald-400 font-semibold">0%</span> : `${(row.fee * 100).toFixed(0)}%`}
                    </td>
                    <td className="px-6 py-4 text-center text-white/50">
                      {row.fee === 0 ? <span className="text-emerald-400">$0</span> : `$${(1000 * row.fee).toFixed(0)}`}
                    </td>
                    <td className="px-6 py-4 text-center text-white/50">
                      {row.fee === 0 ? <span className="text-emerald-400">$0</span> : `$${(10000 * row.fee).toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4 text-center text-white/50">
                      {row.fee === 0 ? <span className="text-emerald-400">$0</span> : `$${(50000 * row.fee).toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-white/25 text-xs mt-4">
            * Stripe&apos;s standard payment processing fee (~2.9% + 30¢) applies to all plans on top of the SAGAH fee.
          </p>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 max-w-2xl mx-auto"
        >
          <h2 className="text-center text-white text-xl font-bold mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <FAQItem key={item.q} {...item} />
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  interval,
  loading,
  onCTA,
  delay,
}: {
  plan: Plan;
  interval: Interval;
  loading: boolean;
  onCTA: () => void;
  delay: number;
}) {
  const price =
    interval === "year" ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const isFree = plan.id === "free";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`relative flex flex-col rounded-2xl border p-6 ${
        plan.highlight
          ? "border-[#FF6B61]/40 bg-[#FF6B61]/[0.04]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#FF6B61] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
            Most popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="mb-4">
        <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${plan.color}`}>
          {plan.name}
        </p>
        <p className="text-white/40 text-xs leading-relaxed">{plan.desc}</p>
      </div>

      {/* Price */}
      <div className="mb-2">
        {isFree ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">Free</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">
              ${price?.toFixed(2)}
            </span>
            <span className="text-white/30 text-sm">/mo</span>
          </div>
        )}
        {!isFree && interval === "year" && (
          <p className="text-white/30 text-xs mt-0.5">
            ${plan.annualTotal}/yr billed annually
          </p>
        )}
      </div>

      {/* Fee badge */}
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-5 w-fit ${
          plan.fee === "0%"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-white/[0.04] text-white/50 border border-white/[0.07]"
        }`}
      >
        <span className={`font-bold ${plan.fee === "0%" ? "text-emerald-400" : plan.color}`}>
          {plan.fee}
        </span>
        {plan.feeNote}
      </div>

      {/* CTA */}
      <button
        onClick={onCTA}
        disabled={loading}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer mb-6 disabled:opacity-60 ${
          plan.highlight
            ? "bg-[#FF6B61] hover:bg-[#ff5244] text-white"
            : isFree
            ? "bg-white text-[#07070e] hover:bg-white/90"
            : "border border-white/10 text-white bg-white/[0.04] hover:bg-white/[0.08]"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Redirecting…
          </span>
        ) : (
          plan.cta
        )}
      </button>

      {/* Features */}
      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <svg
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-white/55 text-xs leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "What counts as a transaction fee?",
    a: "SAGAH's platform fee is applied to every payment processed through your client's Stripe Connect account. This is in addition to Stripe's standard ~2.9% + 30¢ processing fee.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the start of the next billing cycle.",
  },
  {
    q: "What happens when I exceed my end-user limit?",
    a: "You'll receive a notification before you hit your limit. You can upgrade to the next plan to continue growing, or request a custom limit.",
  },
  {
    q: "Is there a free trial on paid plans?",
    a: "Paid plans don't include a trial, but the Free plan has no time limit — take as long as you need before upgrading.",
  },
  {
    q: "Does the annual plan lock me in?",
    a: "Annual plans are billed upfront. If you need to cancel, you'll be on the plan until the end of the billing year.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-white/80 text-sm font-medium hover:text-white transition-colors cursor-pointer"
      >
        <span>{q}</span>
        <svg
          className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-4 text-white/40 text-sm leading-relaxed border-t border-white/[0.05] pt-3">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
