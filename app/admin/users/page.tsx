"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const users = [
  { id: 1, name: 'Acme Corp',     email: 'admin@acme.com',       plan: 'Enterprise', status: 'active',   revenue: 899, joined: '2025-11-12', lastActive: '2h ago',  smbs: 18 },
  { id: 2, name: 'BuildFast Inc', email: 'hi@buildfast.io',       plan: 'Pro',        status: 'active',   revenue: 299, joined: '2026-01-03', lastActive: '5m ago',  smbs: 7  },
  { id: 3, name: 'PixelWave',     email: 'dev@pixelwave.co',      plan: 'Pro',        status: 'active',   revenue: 299, joined: '2026-01-19', lastActive: '1d ago',  smbs: 4  },
  { id: 4, name: 'NexaScale',     email: 'info@nexascale.com',    plan: 'Starter',    status: 'active',   revenue: 49,  joined: '2026-02-01', lastActive: '3h ago',  smbs: 2  },
  { id: 5, name: 'CloudMint',     email: 'ops@cloudmint.io',      plan: 'Starter',    status: 'trial',    revenue: 0,   joined: '2026-03-15', lastActive: '12h ago', smbs: 1  },
  { id: 6, name: 'DataForge',     email: 'team@dataforge.dev',    plan: 'Pro',        status: 'active',   revenue: 299, joined: '2025-12-08', lastActive: '30m ago', smbs: 9  },
  { id: 7, name: 'Tangent Labs',  email: 'hello@tangent.dev',     plan: 'Free',       status: 'inactive', revenue: 0,   joined: '2026-03-28', lastActive: '6d ago',  smbs: 0  },
  { id: 8, name: 'VeloApps',      email: 'cto@veloapps.io',       plan: 'Enterprise', status: 'active',   revenue: 899, joined: '2025-10-22', lastActive: '1h ago',  smbs: 23 },
];

const planColor: Record<string, string> = {
  Enterprise: 'text-orange-400 bg-orange-400/10',
  Pro:        'text-violet-400 bg-violet-400/10',
  Starter:    'text-blue-400 bg-blue-400/10',
  Free:       'text-white/40 bg-white/[0.06]',
};

const statusColor: Record<string, string> = {
  active:   'text-emerald-400 bg-emerald-400/10',
  trial:    'text-yellow-400 bg-yellow-400/10',
  inactive: 'text-white/30 bg-white/[0.05]',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || u.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Users</h1>
        <p className="text-sm text-white/40 mt-0.5">{users.length} total accounts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
        />
        <div className="flex gap-2">
          {['all', 'active', 'trial', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-white/[0.1] text-white' : 'text-white/35 hover:text-white/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Account', 'Plan', 'Status', 'SMBs', 'Revenue', 'Joined', 'Last Active'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-white/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{u.name}</div>
                  <div className="text-xs text-white/35 mt-0.5">{u.email}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planColor[u.plan]}`}>{u.plan}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[u.status]}`}>{u.status}</span>
                </td>
                <td className="px-5 py-4 text-white/60">{u.smbs}</td>
                <td className="px-5 py-4 font-medium text-white">{u.revenue > 0 ? `$${u.revenue}/mo` : '—'}</td>
                <td className="px-5 py-4 text-white/40">{u.joined}</td>
                <td className="px-5 py-4 text-white/40">{u.lastActive}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-white/25 text-sm py-10">No users match your search.</p>
        )}
      </div>
    </div>
  );
}
