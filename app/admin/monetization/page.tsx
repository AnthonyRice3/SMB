"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PLAN_PRICE: Record<string, number> = { free: 0, starter: 49, pro: 299, enterprise: 899 };
const PLAN_COLOR: Record<string, string> = {
  enterprise: 'bg-orange-400',
  pro:        'bg-violet-400',
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const mrr  = stats?.mrr ?? 0;
  const arr  = stats?.arr ?? 0;
  const total = stats?.total ?? 0;
  const arpu  = total > 0 ? (mrr / total) : 0;

  const monthly = stats?.monthlyRevenue ?? Array(6).fill(0);
  const maxRev  = Math.max(...monthly, 1);

  const planCounts = stats?.planCounts ?? {};
  const planRows = Object.entries(planCounts)
    .map(([plan, count]) => ({
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      key: plan,
      users: count,
      revenue: (PLAN_PRICE[plan] ?? 0) * count,
    }))
    .sort((a, b) => b.revenue - a.revenue);
  const maxUsers = Math.max(...planRows.map((p) => p.users), 1);

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Monetization</h1>
        <p className="text-sm text-white/40 mt-0.5">Revenue, plans, and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'MRR',               value: loading ? 'â€”' : `$${mrr.toLocaleString()}` },
          { label: 'ARR',               value: loading ? 'â€”' : `$${arr.toLocaleString()}` },
          { label: 'Total Clients',     value: loading ? 'â€”' : total.toString()           },
          { label: 'Avg Revenue / User', value: loading ? 'â€”' : `$${arpu.toFixed(0)}`     },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
          >
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h2 className="text-sm font-medium text-white mb-6">Monthly Revenue (6 mo)</h2>
          <div className="flex items-end gap-3 h-36">
            {monthly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                {v > 0 && <span className="text-xs text-white/40">${(v / 1000).toFixed(1)}k</span>}
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${(v / maxRev) * 100}%`,
                    minHeight: '4px',
                    background: i === monthly.length - 1 ? '#FF6B61' : 'rgba(255,107,97,0.25)',
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                />
                <span className="text-[11px] text-white/30">{MONTH_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Plan breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
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
                      {p.users} user{p.users !== 1 ? 's' : ''} Â· ${p.revenue.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
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

      {/* Transactions placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white">Recent Transactions</h2>
        </div>
        <div className="px-6 py-10 text-center text-white/25 text-sm">
          Transaction history will appear here once Stripe webhooks are connected.
        </div>
      </motion.div>
    </div>
  );
}
