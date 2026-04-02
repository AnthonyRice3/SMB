"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const actions = [
  { id: 1,  user: 'Acme Corp',     email: 'admin@acme.com',      action: 'Created payout',        detail: 'Amount: $1,200 → Chase ****4821',                       time: 'Apr 2, 2026 · 2:14 PM', type: 'payment' },
  { id: 2,  user: 'BuildFast Inc', email: 'hi@buildfast.io',      action: 'User signed up',         detail: 'New employee: j.doe@buildfast.io',                       time: 'Apr 2, 2026 · 1:58 PM', type: 'auth'    },
  { id: 3,  user: 'PixelWave',     email: 'dev@pixelwave.co',     action: 'Plan upgraded',          detail: 'Starter → Pro ($299/mo)',                                time: 'Apr 2, 2026 · 1:22 PM', type: 'plan'    },
  { id: 4,  user: 'NexaScale',     email: 'info@nexascale.com',   action: 'Invoice paid',           detail: 'Invoice #INV-2026-041 — $49.00',                         time: 'Apr 2, 2026 · 11:05 AM',type: 'payment' },
  { id: 5,  user: 'CloudMint',     email: 'ops@cloudmint.io',     action: 'Password reset',         detail: 'Via email link',                                         time: 'Apr 2, 2026 · 9:48 AM', type: 'auth'    },
  { id: 6,  user: 'Acme Corp',     email: 'admin@acme.com',       action: 'API key created',        detail: 'Key: sk_live_••••••••4f2c',                              time: 'Apr 2, 2026 · 9:30 AM', type: 'api'     },
  { id: 7,  user: 'DataForge',     email: 'team@dataforge.dev',   action: 'Schema updated',         detail: 'Collection: client_profiles — 3 fields added',           time: 'Apr 1, 2026 · 5:12 PM', type: 'data'    },
  { id: 8,  user: 'VeloApps',      email: 'cto@veloapps.io',      action: 'Email template saved',   detail: 'Template: onboarding_welcome_v3',                        time: 'Apr 1, 2026 · 4:44 PM', type: 'email'   },
  { id: 9,  user: 'VeloApps',      email: 'cto@veloapps.io',      action: 'Created payout',         detail: 'Amount: $3,400 → Wells Fargo ****7702',                  time: 'Apr 1, 2026 · 2:01 PM', type: 'payment' },
  { id: 10, user: 'BuildFast Inc', email: 'hi@buildfast.io',      action: 'Webhook registered',     detail: 'URL: https://buildfast.io/api/webhooks/smc',             time: 'Apr 1, 2026 · 11:30 AM',type: 'api'     },
  { id: 11, user: 'Tangent Labs',  email: 'hello@tangent.dev',    action: 'User signed up',         detail: 'Account created via Google OAuth',                      time: 'Mar 28, 2026 · 10:05 AM',type: 'auth'   },
  { id: 12, user: 'NexaScale',     email: 'info@nexascale.com',   action: 'Email campaign sent',    detail: '42 recipients — Campaign: spring_promo',                time: 'Mar 28, 2026 · 9:00 AM', type: 'email'  },
];

const typeStyles: Record<string, { label: string; cls: string }> = {
  payment: { label: 'Payment', cls: 'text-emerald-400 bg-emerald-400/10' },
  auth:    { label: 'Auth',    cls: 'text-blue-400 bg-blue-400/10'       },
  plan:    { label: 'Plan',    cls: 'text-violet-400 bg-violet-400/10'   },
  api:     { label: 'API',     cls: 'text-orange-400 bg-orange-400/10'   },
  data:    { label: 'Data',    cls: 'text-cyan-400 bg-cyan-400/10'        },
  email:   { label: 'Email',   cls: 'text-pink-400 bg-pink-400/10'       },
};

const types = ['all', 'payment', 'auth', 'plan', 'api', 'data', 'email'];

export default function ActionsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? actions : actions.filter((a) => a.type === filter);

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">User Actions</h1>
        <p className="text-sm text-white/40 mt-0.5">Real-time activity log</p>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((t) => {
          const isActive = filter === t;
          const style = t !== 'all' ? typeStyles[t].cls : 'text-white bg-white/[0.1]';
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                isActive
                  ? t === 'all' ? 'bg-white/[0.1] text-white' : style
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {t === 'all' ? 'All events' : typeStyles[t].label}
            </button>
          );
        })}
      </div>

      {/* Events */}
      <div className="space-y-2">
        {filtered.map((a, i) => {
          const ts = typeStyles[a.type];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4"
            >
              <span className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg h-fit ${ts.cls}`}>
                {ts.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium">{a.action}</div>
                <div className="text-xs text-white/40 mt-0.5 truncate">{a.detail}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm text-white/60">{a.user}</div>
                <div className="text-xs text-white/25 mt-0.5">{a.time}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
