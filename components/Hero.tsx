"use client";

import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } },
});

const bars = [38, 52, 44, 72, 61, 85, 54, 90, 68, 96, 78, 88];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 inset-x-0 flex justify-center">
        <div className="h-[500px] w-[800px] rounded-full bg-[#FF6B61]/[0.07] blur-[160px]" />
      </div>

      {/* Headline block */}
      <motion.div
        className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center"
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp(0)}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] text-white/60 text-sm rounded-full px-4 py-1.5 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B61] animate-pulse inline-block" />
          Now in early access
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp(0.06)}
          className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.06] text-white mb-6"
        >
          Build SMB apps{' '}
          <span className="bg-gradient-to-r from-[#FF6B61] via-[#FF9A8B] to-[#ffc5b9] bg-clip-text text-transparent">
            faster, together.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp(0.12)}
          className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-7"
        >
          Connect your customers to Stripe, Clerk, MongoDB and more — one platform to
          onboard, manage, and payout your SMB clients securely.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp(0.18)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.a
            href="#get-started"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#FF6B61] hover:bg-[#ff5244] text-white py-3 px-7 rounded-full font-semibold text-sm transition-colors"
          >
            Create free account
          </motion.a>
          <motion.a
            href="/how-it-works"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white py-3 px-7 rounded-full font-semibold text-sm transition-colors"
          >
            See how it works →
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Dashboard mockup */}
      <motion.div
        className="relative max-w-4xl mx-auto px-6 pb-24"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glow under card */}
        <div className="pointer-events-none absolute -inset-x-12 bottom-16 h-24 bg-[#FF6B61]/[0.05] blur-[60px]" />
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <div className="ml-3 h-4 w-40 bg-white/[0.05] rounded-md" />
          </div>
          {/* Stats row */}
          <div className="p-5 grid grid-cols-3 gap-3">
            {([
              { value: '$24.8k', label: 'Monthly Revenue', badge: '+12%' },
              { value: '128',    label: 'Active SMBs',     badge: '+5'   },
              { value: '99.8%', label: 'Uptime',           badge: 'Live' },
            ] as const).map(({ value, label, badge }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl font-bold text-white">{value}</span>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">{badge}</span>
                </div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>
          {/* Bar chart */}
          <div className="px-5 pb-6">
            <div className="text-xs text-white/30 mb-3 font-medium">Revenue — last 12 weeks</div>
            <div className="flex items-end gap-1.5 h-24">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm origin-bottom"
                  style={{
                    height: `${h}%`,
                    background: i === bars.length - 1 ? '#FF6B61' : 'rgba(255,107,97,0.18)',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.5 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
