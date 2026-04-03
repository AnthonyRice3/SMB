"use client";

import { motion } from 'framer-motion';

const stats = [
  { value: '10k+', label: 'Developers' },
  { value: '$2M+', label: 'Processed' },
  { value: '50ms', label: 'Avg latency' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export default function AboutSection() {
  return (
    <section className="py-24 px-6" id="about">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">About us</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
            Built for developers who ship for small businesses
          </h2>
          <p className="text-white/50 leading-7 mb-4">
            SAGAH gives you a single platform to integrate the best tools for your SMB clients —
            auth, payments, storage, and email — without wrestling with each vendor’s SDK individually.
          </p>
          <p className="text-white/50 leading-7">
            Whether you’re building a fintech app, a SaaS product, or an internal tool, SAGAH
            handles the boring infrastructure so you can focus on what matters.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
            >
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-white/40">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
