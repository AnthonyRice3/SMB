"use client";

import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    color: 'text-violet-400 bg-violet-400/10',
    title: 'Stripe Connect',
    desc: 'Fast onboarding and split payouts for your SMBs — automated and compliant.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: 'text-blue-400 bg-blue-400/10',
    title: 'Clerk Auth',
    desc: 'Secure multi-tenant authentication and full org management out of the box.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    color: 'text-emerald-400 bg-emerald-400/10',
    title: 'MongoDB',
    desc: 'Flexible data models with schema validation — one collection per SMB client.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    color: 'text-orange-400 bg-orange-400/10',
    title: 'Resend Emails',
    desc: 'Transactional emails, beautiful templates, and best-in-class deliverability.',
  },
];

const card = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6" id="learn">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-3">Features</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Everything you need to ship</h2>
          <p className="mt-3 text-white/50 max-w-xl mx-auto">
            Pre-wired integrations so you can focus on building your product, not infrastructure.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={card}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors cursor-default"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-6">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
