"use client";

import { motion } from 'framer-motion';

const stats = [
  { label: 'Page Views',   value: '84,320', change: '+14.2%' },
  { label: 'Sessions',     value: '31,204', change: '+9.1%'  },
  { label: 'Bounce Rate',  value: '38.4%',  change: '-2.1%'  },
  { label: 'Avg. Duration',value: '4m 32s', change: '+18s'   },
];

const dailyViews = [4200, 5100, 4800, 6300, 5900, 7200, 8100, 6800, 7500, 8900, 7400, 9200, 8400, 10100];

const topPages = [
  { path: '/dashboard',   views: 18420, bounce: '28%' },
  { path: '/onboarding',  views: 12350, bounce: '41%' },
  { path: '/payments',    views: 9870,  bounce: '33%' },
  { path: '/users',       views: 8100,  bounce: '22%' },
  { path: '/settings',    views: 5430,  bounce: '55%' },
  { path: '/',            views: 4800,  bounce: '62%' },
];

const devices = [
  { label: 'Desktop', pct: 64, color: 'bg-[#FF6B61]'  },
  { label: 'Mobile',  pct: 28, color: 'bg-violet-400'  },
  { label: 'Tablet',  pct: 8,  color: 'bg-blue-400'    },
];

const maxViews    = Math.max(...dailyViews);
const maxPageView = Math.max(...topPages.map((p) => p.views));

function linePath(data: number[]) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 500;
      const y = 100 - ((v - min) / range) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function AnalyticsPage() {
  const path = linePath(dailyViews);
  const areaPath = `${path} L 500 100 L 0 100 Z`;

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-white/40 mt-0.5">Last 30 days</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
          >
            <p className="text-xs text-white/40 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
            <span className="mt-1.5 inline-block text-xs font-medium text-emerald-400">{s.change}</span>
          </motion.div>
        ))}
      </div>

      {/* Line chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white">Page Views — Last 14 days</h2>
          <span className="text-xs text-white/30">84,320 total</span>
        </div>
        <div className="h-28 w-full">
          <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B61" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF6B61" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#areaGrad)" />
            <motion.path
              d={path}
              fill="none"
              stroke="#FF6B61"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </svg>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top pages */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h2 className="text-sm font-medium text-white mb-5">Top Pages</h2>
          <div className="space-y-4">
            {topPages.map((p) => (
              <div key={p.path}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-white/70 font-mono text-xs">{p.path}</span>
                  <span className="text-white/40 text-xs">{p.views.toLocaleString()} · {p.bounce} bounce</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FF6B61]/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.views / maxPageView) * 100}%` }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Devices + daily bars */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h2 className="text-sm font-medium text-white mb-5">Device Breakdown</h2>
          <div className="space-y-4">
            {devices.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-white/70">{d.label}</span>
                  <span className="text-sm font-semibold text-white">{d.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${d.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct}%` }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-xs text-white/30 mb-3">Daily sessions — last 14 days</p>
            <div className="flex items-end gap-1 h-14">
              {dailyViews.map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(v / maxViews) * 100}%`,
                    background: i === dailyViews.length - 1 ? '#FF6B61' : 'rgba(255,107,97,0.2)',
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.4 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
