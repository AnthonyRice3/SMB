"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: d } },
});

type Interval = "month" | "year";
type PlanId = "free" | "starter" | "growth" | "pro";

interface Plan {
  id: PlanId;
  name: string;
  desc: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualTotal: number;
  fee: string;
  feeNote: string;
  color: string;
  highlight: boolean;
  features: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    desc: "Everything you need to launch your first app.",
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    annualTotal: 0,
    fee: "15%",
    feeNote: "platform fee per transaction",
    color: "text-white/60",
    highlight: false,
    cta: "Current plan",
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
    desc: "For growing businesses ready to scale.",
    monthlyPrice: 10,
    annualMonthlyPrice: 7.5,
    annualTotal: 90,
    fee: "10%",
    feeNote: "platform fee per transaction",
    color: "text-violet-400",
    highlight: false,
    cta: "Upgrade to Starter",
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
    cta: "Upgrade to Growth",
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
    desc: "For agencies who want zero friction.",
    monthlyPrice: 35,
    annualMonthlyPrice: 26.25,
    annualTotal: 315,
    fee: "0%",
    feeNote: "no transaction fees at all",
    color: "text-amber-400",
    highlight: false,
    cta: "Upgrade to Pro",
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

const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, growth: 2, pro: 3, enterprise: 4 };

export default function UpgradePage() {
  const [interval, setInterval]   = useState<Interval>("month");
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading]     = useState<PlanId | null>(null);
  const [clientLoading, setClientLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients/me")
      .then((r) => r.json())
      .then((d) => { if (d?.plan) setCurrentPlan(d.plan.toLowerCase()); })
      .catch(() => null)
      .finally(() => setClientLoading(false));
  }, []);

  async function handleUpgrade(plan: Plan) {
    if (plan.id === currentPlan) return;
    if (plan.id === "free") return;

    setLoading(plan.id);
    try {
      const res = await fetch("/api/stripe/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        console.error("[upgrade] checkout error", data);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("[upgrade] network error", err);
    } finally {
      setLoading(null);
    }
  }

  const currentPlanOrder = PLAN_ORDER[currentPlan] ?? 0;

  return (
    <div className="px-8 py-8 max-w-6xl">
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Upgrade your plan</h1>
        <p className="text-sm text-white/40">Lower your transaction fees and unlock more capacity as you grow.</p>
      </motion.div>

      {/* Billing toggle */}
      <motion.div variants={fade(0.04)} initial="hidden" animate="visible" className="flex items-center gap-4 mb-8">
        <span className={`text-sm font-medium transition-colors ${interval === "month" ? "text-white" : "text-white/35"}`}>
          Monthly
        </span>
        <button
          onClick={() => setInterval((v) => (v === "month" ? "year" : "month"))}
          className="relative w-11 h-6 rounded-full bg-white/10 border border-white/10 focus:outline-none"
          aria-label="Toggle billing interval"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#FF6B61] shadow transition-transform duration-200 ${
              interval === "year" ? "translate-x-5" : ""
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full"
            >
              Save 25%
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-12">
        {PLANS.map((plan, i) => {
          const isCurrent  = plan.id === currentPlan;
          const isDowngrade = PLAN_ORDER[plan.id] < currentPlanOrder;
          const price      = interval === "year" ? plan.annualMonthlyPrice : plan.monthlyPrice;
          const isFree     = plan.id === "free";
          const isLoading  = loading === plan.id;

          return (
            <motion.div
              key={plan.id}
              variants={fade(0.08 + i * 0.05)}
              initial="hidden"
              animate="visible"
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                isCurrent
                  ? "border-white/20 bg-white/[0.05]"
                  : plan.highlight && !isDowngrade
                  ? "border-[#FF6B61]/40 bg-[#FF6B61]/[0.04]"
                  : "border-white/[0.07] bg-white/[0.02]"
              }`}
            >
              {/* Current plan badge */}
              {isCurrent && !clientLoading && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-[#07070e] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Current plan
                  </span>
                </div>
              )}

              {/* Most popular badge (only on non-current) */}
              {plan.highlight && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FF6B61] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Most popular
                  </span>
                </div>
              )}

              {/* Name + desc */}
              <div className="mb-4">
                <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${plan.color}`}>
                  {plan.name}
                </p>
                <p className="text-white/40 text-xs leading-relaxed">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-2">
                {isFree ? (
                  <span className="text-3xl font-extrabold text-white">Free</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">${price?.toFixed(2)}</span>
                    <span className="text-white/30 text-sm">/mo</span>
                  </div>
                )}
                {!isFree && interval === "year" && (
                  <p className="text-white/30 text-xs mt-0.5">${plan.annualTotal}/yr billed annually</p>
                )}
              </div>

              {/* Fee badge */}
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-5 w-fit ${
                plan.fee === "0%"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.07]"
              }`}>
                <span className={`font-bold ${plan.fee === "0%" ? "text-emerald-400" : plan.color}`}>{plan.fee}</span>
                {plan.feeNote}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrent || isDowngrade || isLoading || clientLoading}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 mb-6 ${
                  isCurrent
                    ? "bg-white/[0.06] text-white/40 cursor-default border border-white/[0.08]"
                    : isDowngrade
                    ? "bg-white/[0.03] text-white/20 cursor-not-allowed border border-white/[0.05]"
                    : plan.highlight
                    ? "bg-[#FF6B61] hover:bg-[#ff5244] text-white cursor-pointer"
                    : isFree
                    ? "bg-white/[0.06] text-white/30 cursor-default border border-white/[0.08]"
                    : "border border-white/10 text-white bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer"
                } disabled:opacity-60`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Redirecting…
                  </span>
                ) : isCurrent ? (
                  "✓ Current plan"
                ) : isDowngrade ? (
                  "Contact support to downgrade"
                ) : (
                  plan.cta
                )}
              </button>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isCurrent ? "text-white/50" : plan.highlight && !isDowngrade ? "text-[#FF6B61]" : "text-white/30"}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-xs text-white/50 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Fee comparison table */}
      <motion.div variants={fade(0.28)} initial="hidden" animate="visible">
        <h2 className="text-sm font-semibold text-white mb-4">Transaction fee comparison</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-white/30">Plan</th>
                <th className="text-center px-5 py-3.5 text-xs font-medium text-white/30">SAGAH fee</th>
                <th className="text-center px-5 py-3.5 text-xs font-medium text-white/30">$1k processed</th>
                <th className="text-center px-5 py-3.5 text-xs font-medium text-white/30">$10k processed</th>
                <th className="text-center px-5 py-3.5 text-xs font-medium text-white/30">$50k processed</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Free",    fee: 0.15, color: "text-white/60" },
                { name: "Starter", fee: 0.10, color: "text-violet-400" },
                { name: "Growth",  fee: 0.05, color: "text-[#FF6B61]" },
                { name: "Pro",     fee: 0,    color: "text-amber-400" },
              ].map((row, idx) => {
                const isRowCurrent = row.name.toLowerCase() === currentPlan;
                return (
                  <tr
                    key={row.name}
                    className={`border-b border-white/[0.04] last:border-b-0 transition-colors ${
                      isRowCurrent ? "bg-white/[0.04]" : idx % 2 !== 0 ? "bg-white/[0.015]" : ""
                    }`}
                  >
                    <td className={`px-5 py-3.5 font-semibold text-xs ${row.color}`}>
                      {row.name}
                      {isRowCurrent && (
                        <span className="ml-2 text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full font-normal">you</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center text-white/60 text-xs">
                      {row.fee === 0 ? <span className="text-emerald-400 font-semibold">0%</span> : `${(row.fee * 100).toFixed(0)}%`}
                    </td>
                    <td className="px-5 py-3.5 text-center text-white/45 text-xs">
                      {row.fee === 0 ? <span className="text-emerald-400">$0</span> : `$${(1000 * row.fee).toFixed(0)}`}
                    </td>
                    <td className="px-5 py-3.5 text-center text-white/45 text-xs">
                      {row.fee === 0 ? <span className="text-emerald-400">$0</span> : `$${(10000 * row.fee).toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3.5 text-center text-white/45 text-xs">
                      {row.fee === 0 ? <span className="text-emerald-400">$0</span> : `$${(50000 * row.fee).toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-white/20 text-xs mt-3">
          Stripe&apos;s standard fee (~2.9% + 30¢) applies on top. The SAGAH fee is taken via <code className="text-white/35 font-mono text-[10px]">application_fee_amount</code> on each PaymentIntent.
        </p>
      </motion.div>
    </div>
  );
}
