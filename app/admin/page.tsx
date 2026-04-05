"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const quickLinks = [
  { label: 'View all users',  href: '/admin/users',         color: 'text-violet-400'  },
  { label: 'See actions log', href: '/admin/actions',       color: 'text-blue-400'    },
  { label: 'Revenue details', href: '/admin/monetization',  color: 'text-emerald-400' },
  { label: 'Schedule call',   href: '/admin/consultations', color: 'text-[#FF6B61]'   },
];

const fade = (d = 0) => ({
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

interface AdminStats {
  total: number;
  planCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  mrr: number;
  arr: number;
  monthlyRevenue: number[];
  recentClients: { _id: string; name: string; email: string; plan: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const topStats = [
    { label: 'Total Clients',  value: loading ? '—' : String(stats?.total ?? 0),          change: null,   color: 'text-violet-400'  },
    { label: 'MRR',            value: loading ? '—' : `$${(stats?.mrr ?? 0).toLocaleString()}`,   change: null, color: 'text-emerald-400' },
    { label: 'Active',         value: loading ? '—' : String(stats?.statusCounts?.active ?? 0), change: null, color: 'text-emerald-400' },
    { label: 'ARR',            value: loading ? '—' : `$${(stats?.arr ?? 0).toLocaleString()}`,   change: 'Estimated', color: 'text-white' },
  ];

  const bars = stats?.monthlyRevenue ?? Array(6).fill(0);
  const maxBar = Math.max(...bars, 1);

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-0.5">{today}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={fade(0.05)} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {topStats.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} tracking-tight`}>{s.value}</p>
            {s.change && <p className="mt-1.5 text-xs text-white/25">{s.change}</p>}
          </div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent clients */}
        <motion.div
          variants={fade(0.1)} initial="hidden" animate="visible"
          className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-white">Recent Clients</h2>
            <Link href="/admin/users" className="text-xs text-white/30 hover:text-white/60 transition-colors">View all →</Link>
          </div>
          {loading ? (
            <p className="text-sm text-white/25 text-center py-8">Loading…</p>
          ) : (stats?.recentClients ?? []).length === 0 ? (
            <p className="text-sm text-white/25 text-center py-8">No clients yet.</p>
          ) : (
            <div className="space-y-3.5">
              {(stats!.recentClients).map((c) => (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md text-violet-400 bg-violet-400/10">
                    {c.plan ?? 'free'}
                  </span>
                  <span className="text-sm text-white/70 flex-1 min-w-0 truncate">
                    <span className="text-white">{c.name}</span> — {c.email}
                  </span>
                  <span className="text-xs text-white/25 shrink-0">
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <motion.div variants={fade(0.15)} initial="hidden" animate="visible" className="space-y-4">
          {/* Mini revenue chart */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-1">Revenue trend (6 mo)</p>
            <p className="text-xl font-bold text-white mb-4">
              {loading ? '—' : `$${(stats?.mrr ?? 0).toLocaleString()}`}{' '}
              <span className="text-xs text-emerald-400 font-normal">MRR</span>
            </p>
            <div className="flex items-end gap-1 h-16">
              {bars.map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(v / maxBar) * 100}%`,
                    minHeight: '4px',
                    background: i === bars.length - 1 ? '#FF6B61' : 'rgba(255,107,97,0.2)',
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.4 }}
                />
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-4">Quick links</p>
            <div className="space-y-2.5">
              {quickLinks.map((l) => (
                <Link
                  key={l.href} href={l.href}
                  className={`flex items-center justify-between text-sm py-0.5 ${l.color} hover:opacity-80 transition-opacity`}
                >
                  <span>{l.label}</span>
                  <span className="text-white/20">→</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
