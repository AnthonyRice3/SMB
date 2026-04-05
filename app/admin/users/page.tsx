"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const planColor: Record<string, string> = {
  enterprise: 'text-orange-400 bg-orange-400/10',
  pro:        'text-violet-400 bg-violet-400/10',
  starter:    'text-blue-400 bg-blue-400/10',
  free:       'text-white/40 bg-white/[0.06]',
};

const statusColor: Record<string, string> = {
  active:   'text-emerald-400 bg-emerald-400/10',
  trial:    'text-yellow-400 bg-yellow-400/10',
  inactive: 'text-white/30 bg-white/[0.05]',
};

interface ClientRow {
  _id: string;
  name: string;
  email: string;
  plan?: string;
  status?: string;
  createdAt?: string;
}

export default function UsersPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClients(data); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || (u.status ?? 'active') === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Users</h1>
        <p className="text-sm text-white/40 mt-0.5">
          {loading ? 'Loadingâ€¦' : `${clients.length} total account${clients.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or emailâ€¦"
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
              {['Account', 'Plan', 'Status', 'Joined'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-white/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-white/25 text-sm">Loadingâ€¦</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-white/25 text-sm">
                {clients.length === 0 ? 'No clients yet.' : 'No users match your search.'}
              </td></tr>
            ) : filtered.map((u, i) => (
              <motion.tr
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-white">{u.name}</div>
                  <div className="text-xs text-white/35 mt-0.5">{u.email}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${planColor[u.plan?.toLowerCase() ?? 'free'] ?? planColor.free}`}>
                    {u.plan ?? 'free'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[u.status ?? 'active'] ?? statusColor.active}`}>
                    {u.status ?? 'active'}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/40">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'â€”'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

