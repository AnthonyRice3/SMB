"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PLAN_PRICE: Record<string, number> = { free: 0, starter: 10, growth: 20, pro: 35, enterprise: 99 };
const PLAN_COLOR: Record<string, string> = {
  enterprise: 'bg-orange-400',
  pro:        'bg-violet-400',
  growth:     'bg-[#FF6B61]',
  starter:    'bg-blue-400',
  free:       'bg-white/20',
};

interface AdminStats {
  total: number;
  planCounts: Record<string, number>;
  mrr: number;
  arr: number;
  monthlyRevenue: number[];
}

interface StripeVolume {
  grossVolume: number;
  netVolume: number;
  platformFees: number;
  subscriptionMrr: number;
  monthlyGross: number[];
  monthLabels: string[];
  recentCharges: {
    id: string;
    amount: number;
    currency: string;
    description: string | null;
    customerEmail: string | null;
    created: number;
  }[];
}

function last6MonthLabels() {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('en-US', { month: 'short' }));
  }
  return labels;
}

const MONTH_LABELS = last6MonthLabels();

export default function MonetizationPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stripe, setStripe] = useState<StripeVolume | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));

    fetch('/api/admin/stripe-volume')
      .then((r) => r.json())
      .then(setStripe)
      .catch(() => null)
      .finally(() => setStripeLoading(false));
  }, []);

  const mrr   = stats?.mrr ?? 0;
  const arr   = stats?.arr ?? 0;
  const total = stats?.total ?? 0;
  const arpu  = total > 0 ? (mrr / total) : 0;

  const chartData   = stripe?.monthlyGross ?? stats?.monthlyRevenue ?? Array(6).fill(0);
  const chartLabels = stripe?.monthLabels ?? MONTH_LABELS;
  const maxRev      = Math.max(...chartData, 1);

  const planCounts = stats?.planCounts ?? {};
  const planRows = Object.entries(planCounts)
    .map(([plan, count]) => ({
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      key: plan.toLowerCase(),
      users: count,
      revenue: (PLAN_PRICE[plan.toLowerCase()] ?? 0) * count,
    }))
    .sort((a, b) => b.revenue - a.revenue);
  const maxUsers = Math.max(...planRows.map((p) => p.users), 1);

  const fmtUsd = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toLocaleString()}`;

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Monetization</h1>
        <p className="text-sm text-white/40 mt-0.5">Revenue, plans, and Stripe volume</p>
      </div>

      {/* Stripe Gross Volume stats */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
        Stripe - Live Volume (last 6 months)
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gross Volume',     value: stripeLoading ? '...' : fmtUsd(stripe?.grossVolume ?? 0),     color: 'text-white'       },
          { label: 'Net Volume',       value: stripeLoading ? '...' : fmtUsd(stripe?.netVolume ?? 0),       color: 'text-emerald-400' },
          { label: 'Platform Fees',    value: stripeLoading ? '...' : fmtUsd(stripe?.platformFees ?? 0),    color: 'text-[#FF6B61]'   },
          { label: 'Subscription MRR', value: stripeLoading ? '...' : fmtUsd(stripe?.subscriptionMrr ?? 0), color: 'text-violet-400'  },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white/3 border border-white/7 rounded-2xl p-5"
          >
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Platform stats */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
        Platform - Subscription Revenue
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'MRR (seats)',        value: loading ? '...' : `$${mrr.toLocaleString()}` },
          { label: 'ARR (estimate)',     value: loading ? '...' : `$${arr.toLocaleString()}` },
          { label: 'Total Clients',      value: loading ? '...' : total.toString()           },
          { label: 'Avg Revenue / User', value: loading ? '...' : `$${arpu.toFixed(0)}`     },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 + i * 0.06 }}
            className="bg-white/3 border border-white/7 rounded-2xl p-5"
          >
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Gross volume bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/3 border border-white/7 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-white">Gross Volume (6 mo)</h2>
            {!stripeLoading && stripe && (
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full font-semibold">
                Live from Stripe
              </span>
            )}
          </div>
          <div className="flex items-end gap-3 h-36">
            {chartData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                {v > 0 && (
                  <span className="text-xs text-white/40">
                    {v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
                  </span>
                )}
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${(v / maxRev) * 100}%`,
                    minHeight: '4px',
                    background: i === chartData.length - 1 ? '#FF6B61' : 'rgba(255,107,97,0.25)',
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                />
                <span className="text-[11px] text-white/30">{chartLabels[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Plan breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/3 border border-white/7 rounded-2xl p-6"
        >
          <h2 className="text-sm font-medium text-white mb-6">Plan Breakdown</h2>
          {planRows.length === 0 ? (
            <p className="text-sm text-white/25 text-center py-8">No clients yet.</p>
          ) : (
            <div className="space-y-5">
              {planRows.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">{p.name}</span>
                    <span className="text-white/40 text-xs">
                      {p.users} user{p.users !== 1 ? 's' : ''} - ${p.revenue.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${PLAN_COLOR[p.key] ?? 'bg-white/20'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.users / maxUsers) * 100}%` }}
                      transition={{ delay: 0.4, duration: 0.7 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Stripe charges */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white/3 border border-white/7 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Recent Charges</h2>
          {!stripeLoading && stripe && (
            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full font-semibold">
              Live from Stripe
            </span>
          )}
        </div>
        {stripeLoading ? (
          <div className="px-6 py-10 text-center text-white/25 text-sm">Loading...</div>
        ) : !stripe || stripe.recentCharges.length === 0 ? (
          <div className="px-6 py-10 text-center text-white/25 text-sm">
            No charges yet - they will appear here once payments are processed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-130">
              <thead>
                <tr className="border-b border-white/6">
                  {['Customer', 'Description', 'Amount', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stripe.recentCharges.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.03 }}
                    className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-white/70 text-xs font-mono truncate max-w-40">
                      {c.customerEmail ?? '-'}
                    </td>
                    <td className="px-5 py-3.5 text-white/50 text-xs truncate max-w-45">
                      {c.description ?? '-'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-white text-xs">
                      ${(c.amount / 100).toFixed(2)}{' '}
                      <span className="text-white/30 font-normal uppercase">{c.currency}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/40 text-xs">
                      {new Date(c.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}