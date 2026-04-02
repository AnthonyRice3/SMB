"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
  { label: 'Total Users',      value: '247',     change: '+12',   positive: true,  note: 'this month' },
  { label: 'MRR',              value: '$18,320',  change: '+8.4%', positive: true,  note: 'vs last month' },
  { label: 'Active Sessions',  value: '42',       change: '-3',    positive: false, note: 'right now' },
  { label: 'Conversion Rate',  value: '3.8%',     change: '+0.3%', positive: true,  note: 'last 30 days' },
];

const activity = [
  { user: 'Acme Corp',     action: 'Created payout',       amount: '+$1,200', time: '2m ago',  type: 'payment' },
  { user: 'BuildFast Inc', action: 'New user signup',       amount: null,      time: '14m ago', type: 'auth'    },
  { user: 'PixelWave',     action: 'Plan upgraded to Pro',  amount: null,      time: '38m ago', type: 'plan'    },
  { user: 'NexaScale',     action: 'Invoice paid',          amount: '+$299',   time: '1h ago',  type: 'payment' },
  { user: 'CloudMint',     action: 'Password reset',        amount: null,      time: '2h ago',  type: 'auth'    },
  { user: 'Acme Corp',     action: 'API key created',       amount: null,      time: '3h ago',  type: 'api'     },
];

const quickLinks = [
  { label: 'View all users',  href: '/admin/users',         color: 'text-violet-400'  },
  { label: 'See actions log', href: '/admin/actions',       color: 'text-blue-400'    },
  { label: 'Revenue details', href: '/admin/monetization',  color: 'text-emerald-400' },
  { label: 'Schedule call',   href: '/admin/consultations', color: 'text-[#FF6B61]'   },
];

const bars = [62, 68, 71, 65, 78, 74, 82, 79, 88, 85, 91, 100];

const typeColor: Record<string, string> = {
  payment: 'text-emerald-400 bg-emerald-400/10',
  auth:    'text-blue-400 bg-blue-400/10',
  plan:    'text-violet-400 bg-violet-400/10',
  api:     'text-orange-400 bg-orange-400/10',
};

const fade = (d = 0) => ({
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

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
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${s.positive ? 'text-emerald-400' : 'text-red-400'}`}>{s.change}</span>
              <span className="text-xs text-white/25">{s.note}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Activity feed */}
        <motion.div
          variants={fade(0.1)} initial="hidden" animate="visible"
          className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-white">Recent Activity</h2>
            <Link href="/admin/actions" className="text-xs text-white/30 hover:text-white/60 transition-colors">View all →</Link>
          </div>
          <div className="space-y-3.5">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${typeColor[a.type] ?? 'text-white/40 bg-white/5'}`}>
                  {a.type}
                </span>
                <span className="text-sm text-white/70 flex-1 min-w-0 truncate">
                  <span className="text-white">{a.user}</span> — {a.action}
                </span>
                {a.amount && <span className="text-sm font-medium text-emerald-400 shrink-0">{a.amount}</span>}
                <span className="text-xs text-white/25 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div variants={fade(0.15)} initial="hidden" animate="visible" className="space-y-4">
          {/* Mini revenue chart */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-1">Revenue trend</p>
            <p className="text-xl font-bold text-white mb-4">
              $18,320 <span className="text-xs text-emerald-400 font-normal">MRR</span>
            </p>
            <div className="flex items-end gap-1 h-16">
              {bars.map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${v}%`,
                    background: i === bars.length - 1 ? '#FF6B61' : 'rgba(255,107,97,0.2)',
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.4 }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-white/20">Jan</span>
              <span className="text-[10px] text-white/20">Dec</span>
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
