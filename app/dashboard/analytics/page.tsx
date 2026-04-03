"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

/* ─── Mock data ──────────────────────────────────────────── */
const MONTHLY_REVENUE = [820, 1040, 980, 1320, 1180, 1540, 1420, 1830, 1760, 2100, 1940, 2340];
const MONTHLY_LABELS  = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const PAGE_VIEWS = [1240, 1680, 1520, 2100, 1840, 2560, 2280, 3100, 2840, 3600, 3200, 4120];

const TOP_PAGES = [
  { page: "/",             views: 4120, change: "+18%", positive: true },
  { page: "/how-it-works", views: 1840, change: "+42%", positive: true },
  { page: "/contact",      views: 1210, change: "+31%", positive: true },
  { page: "/about",        views: 680,  change: "+8%",  positive: true },
  { page: "/dashboard",    views: 310,  change: "-5%",  positive: false },
];

const TRANSACTIONS = [
  { name: "Jane Doe",     plan: "Pro",        amount: "$29.00",  date: "Apr 1, 2026",  status: "paid" },
  { name: "Mike Torres",  plan: "Enterprise", amount: "$99.00",  date: "Apr 1, 2026",  status: "paid" },
  { name: "Bob Smith",    plan: "Pro",        amount: "$29.00",  date: "Apr 1, 2026",  status: "paid" },
  { name: "Chris Nguyen", plan: "Pro",        amount: "$29.00",  date: "Mar 29, 2026", status: "paid" },
  { name: "Sara Lee",     plan: "Free",       amount: "$0.00",   date: "Mar 28, 2026", status: "free" },
];

export default function AnalyticsPage() {
  const [metricTab, setMetricTab] = useState<"revenue" | "traffic">("revenue");

  const maxRev   = Math.max(...MONTHLY_REVENUE);
  const maxViews = Math.max(...PAGE_VIEWS);
  const totalMRR   = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
  const totalARR   = totalMRR * 12;
  const totalViews = PAGE_VIEWS.reduce((a, b) => a + b, 0);
  const revGrowth  = (((MONTHLY_REVENUE[11] - MONTHLY_REVENUE[10]) / MONTHLY_REVENUE[10]) * 100).toFixed(1);
  const viewGrowth = (((PAGE_VIEWS[11] - PAGE_VIEWS[10]) / PAGE_VIEWS[10]) * 100).toFixed(1);

  const bars = metricTab === "revenue" ? MONTHLY_REVENUE : PAGE_VIEWS;
  const maxBar = metricTab === "revenue" ? maxRev : maxViews;
  const barColor = metricTab === "revenue" ? "bg-emerald-400/50 hover:bg-emerald-400" : "bg-blue-400/50 hover:bg-blue-400";

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-2">
        <h1 className="text-xl font-semibold text-white">Analytics & Revenue</h1>
        <p className="text-sm text-white/40 mt-1">
          Your app&apos;s performance metrics.{" "}
          <span className="text-amber-400">Sample data shown</span> — live metrics activate at launch.
        </p>
      </motion.div>

      {/* Top stats */}
      <motion.div
        variants={fade(0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-8"
      >
        {[
          { label: "MRR",          value: `$${totalMRR.toLocaleString()}`,   change: `+${revGrowth}%`,   positive: true,  color: "text-emerald-400" },
          { label: "ARR (12-mo projection)", value: `$${totalARR.toLocaleString()}`, change: "Annualized", positive: true, color: "text-emerald-400" },
          { label: "Page views (last 12 mo)", value: totalViews.toLocaleString(), change: `+${viewGrowth}% last mo`, positive: true, color: "text-blue-400" },
          { label: "Conversion rate", value: "3.8%", change: "+0.4% this mo", positive: true, color: "text-violet-400" },
        ].map(({ label, value, change, positive, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-2">{label}</p>
            <p className={`text-xl font-bold ${color} mb-1`}>{value}</p>
            <p className={`text-xs ${positive ? "text-emerald-400" : "text-red-400"}`}>{change}</p>
          </div>
        ))}
      </motion.div>

      {/* Chart section */}
      <motion.div
        variants={fade(0.1)}
        initial="hidden"
        animate="visible"
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-6"
      >
        {/* Tab switcher */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {metricTab === "revenue" ? "Monthly Revenue" : "Monthly Page Views"}
            </h2>
            <p className="text-xs text-white/30 mt-0.5">Last 12 months</p>
          </div>
          <div className="flex gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {(["revenue", "traffic"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMetricTab(t)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  metricTab === t ? "text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {metricTab === t && (
                  <motion.div
                    layoutId="analytics-tab"
                    className="absolute inset-0 bg-white/[0.08] rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t === "revenue" ? "💰 Revenue" : "📈 Traffic"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5 h-40">
          {bars.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <motion.div
                className={`w-full rounded-t-md ${barColor} transition-colors cursor-default`}
                style={{ height: `${(val / maxBar) * 100}%`, minHeight: "4px" }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                title={metricTab === "revenue" ? `$${val}` : `${val.toLocaleString()} views`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {MONTHLY_LABELS.map((l) => (
            <span key={l} className="flex-1 text-center text-[9px] text-white/20">{l}</span>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <motion.div
          variants={fade(0.15)}
          initial="hidden"
          animate="visible"
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-4">Top pages</h2>
          <div className="space-y-3">
            {TOP_PAGES.map(({ page, views, change, positive }) => {
              const pct = (views / TOP_PAGES[0].views) * 100;
              return (
                <div key={page}>
                  <div className="flex justify-between items-center mb-1">
                    <code className="text-xs text-white/70 font-mono">{page}</code>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">{views.toLocaleString()}</span>
                      <span className={`text-[10px] font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>{change}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-400/50 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Revenue breakdown */}
        <motion.div
          variants={fade(0.18)}
          initial="hidden"
          animate="visible"
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-4">Plan breakdown</h2>
          <div className="space-y-3 mb-5">
            {[
              { plan: "Enterprise", count: 1,  mrr: "$99",  pct: 42, color: "bg-[#FF6B61]" },
              { plan: "Pro",        count: 3,  mrr: "$87",  pct: 37, color: "bg-violet-400" },
              { plan: "Free",       count: 2,  mrr: "$0",   pct: 0,  color: "bg-white/20" },
            ].map(({ plan, count, mrr, pct, color }) => (
              <div key={plan}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/70">{plan}</span>
                  <span className="text-xs text-white/40">{count} user{count !== 1 ? "s" : ""}  ·  {mrr}/mo</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${color} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between">
              <span className="text-xs text-white/40">Total MRR</span>
              <span className="text-sm font-bold text-emerald-400">$186 <span className="text-white/25 font-normal text-xs">/ month</span></span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div
        variants={fade(0.22)}
        initial="hidden"
        animate="visible"
        className="mt-6 bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Recent transactions</h2>
        </div>
        <div>
          {TRANSACTIONS.map((t, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-6 py-3.5 ${i < TRANSACTIONS.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.015] transition-colors`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-white/30">{t.date}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                t.plan === "Enterprise" ? "bg-[#FF6B61]/10 text-[#FF6B61]" : t.plan === "Pro" ? "bg-violet-400/10 text-violet-400" : "bg-white/[0.05] text-white/30"
              }`}>
                {t.plan}
              </span>
              <span className={`text-sm font-bold ${t.status === "paid" ? "text-emerald-400" : "text-white/25"}`}>
                {t.amount}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
