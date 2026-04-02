"use client";

import { motion } from 'framer-motion';

const stats = [
  { label: 'MRR',                  value: '$18,320',  change: '+8.4%',  note: 'vs last month' },
  { label: 'ARR',                  value: '$219,840', change: '+8.4%',  note: 'projected'     },
  { label: 'Total Revenue',        value: '$142,800', change: '+22%',   note: 'all time'      },
  { label: 'Avg Revenue / User',   value: '$74.2',    change: '+5.1%',  note: 'per user'      },
];

const monthly = [
  { month: 'Nov', value: 12400 },
  { month: 'Dec', value: 13800 },
  { month: 'Jan', value: 14100 },
  { month: 'Feb', value: 15200 },
  { month: 'Mar', value: 16900 },
  { month: 'Apr', value: 18320 },
];

const plans = [
  { name: 'Enterprise',  users: 18,  revenue: 16182, color: 'bg-orange-400' },
  { name: 'Pro',         users: 112, revenue: 33488, color: 'bg-violet-400' },
  { name: 'Starter',     users: 89,  revenue: 4361,  color: 'bg-blue-400'   },
  { name: 'Free / Trial',users: 28,  revenue: 0,     color: 'bg-white/20'   },
];

const transactions = [
  { user: 'VeloApps',      type: 'Payout',       amount: '+$3,400', date: 'Apr 1, 2026', status: 'settled' },
  { user: 'NexaScale',     type: 'Subscription', amount: '+$49',    date: 'Apr 1, 2026', status: 'settled' },
  { user: 'Acme Corp',     type: 'Payout',       amount: '+$1,200', date: 'Apr 2, 2026', status: 'pending' },
  { user: 'DataForge',     type: 'Subscription', amount: '+$299',   date: 'Apr 1, 2026', status: 'settled' },
  { user: 'PixelWave',     type: 'Plan Upgrade', amount: '+$250',   date: 'Apr 2, 2026', status: 'settled' },
  { user: 'BuildFast Inc', type: 'Subscription', amount: '+$299',   date: 'Mar 31, 2026',status: 'settled' },
];

const maxRev   = Math.max(...monthly.map((m) => m.value));
const maxUsers = Math.max(...plans.map((p) => p.users));

export default function MonetizationPage() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Monetization</h1>
        <p className="text-sm text-white/40 mt-0.5">Revenue, plans, and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
          >
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-xs font-medium text-emerald-400">{s.change}</span>
              <span className="text-xs text-white/25">{s.note}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h2 className="text-sm font-medium text-white mb-6">Monthly Revenue</h2>
          <div className="flex items-end gap-3 h-36">
            {monthly.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-white/40">${(m.value / 1000).toFixed(1)}k</span>
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${(m.value / maxRev) * 100}%`,
                    background: i === monthly.length - 1 ? '#FF6B61' : 'rgba(255,107,97,0.25)',
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                />
                <span className="text-[11px] text-white/30">{m.month}</span>
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
          <div className="space-y-5">
            {plans.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">{p.name}</span>
                  <span className="text-white/40 text-xs">{p.users} users · ${p.revenue.toLocaleString()}/mo</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${p.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.users / maxUsers) * 100}%` }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Transactions table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-medium text-white">Recent Transactions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Account', 'Type', 'Amount', 'Date', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-white/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5 text-white">{t.user}</td>
                <td className="px-5 py-3.5 text-white/50">{t.type}</td>
                <td className="px-5 py-3.5 font-medium text-emerald-400">{t.amount}</td>
                <td className="px-5 py-3.5 text-white/40">{t.date}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    t.status === 'settled'
                      ? 'text-emerald-400 bg-emerald-400/10'
                      : 'text-yellow-400 bg-yellow-400/10'
                  }`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
