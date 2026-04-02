"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { addInquiry } from '../../lib/inquiries';

/* ─── Constants ─────────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const TIMES  = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM'];
const TOPICS = ['General Demo','Stripe Connect Setup','Clerk Auth Configuration','MongoDB Schema Design','Resend Email Integration','Custom Integration'];
const TODAY  = new Date(2026, 3, 2);

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ─── Why / Features cards ──────────────────────────────── */
const WHY = [
  {
    color: 'text-violet-400 bg-violet-400/10',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    title: 'Live product walkthrough',
    desc: 'See every feature working in a real SMB context with our team guiding you through.',
  },
  {
    color: 'text-blue-400 bg-blue-400/10',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Integration advice',
    desc: 'Get expert guidance on Stripe, Clerk, MongoDB, and Resend tailored to your use case.',
  },
  {
    color: 'text-emerald-400 bg-emerald-400/10',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Implementation roadmap',
    desc: "Walk away with a clear, step-by-step plan to ship your SMB platform end to end.",
  },
  {
    color: 'text-orange-400 bg-orange-400/10',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Reply within 24 hours',
    desc: 'Every inquiry gets a personal, thoughtful response from our team the same business day.',
  },
];

/* ─── Page ──────────────────────────────────────────────── */
export default function ContactPage() {
  const [tab,      setTab]      = useState<'inquiry' | 'demo'>('inquiry');
  const [done,     setDone]     = useState(false);

  /* Inquiry form */
  const [iq, setIq] = useState({ name: '', email: '', company: '', message: '' });

  /* Demo form */
  const [dm,       setDm]       = useState({ name: '', email: '', company: '', topic: '', duration: '30' });
  const [demoDate, setDemoDate] = useState<Date | null>(null);
  const [demoSlot, setDemoSlot] = useState<string | null>(null);
  const [viewMo,   setViewMo]   = useState(new Date(2026, 3, 1));

  /* Calendar helpers */
  const yr   = viewMo.getFullYear();
  const mo   = viewMo.getMonth();
  const dNum = new Date(yr, mo + 1, 0).getDate();
  const fDay = new Date(yr, mo, 1).getDay();
  const isDis = (d: number) => {
    const dt = new Date(yr, mo, d);
    return dt < TODAY || [0, 6].includes(dt.getDay());
  };
  const isTod = (d: number) => toKey(new Date(yr, mo, d)) === toKey(TODAY);
  const isSel = (d: number) => !!demoDate && toKey(new Date(yr, mo, d)) === toKey(demoDate);

  /* Handlers */
  function scrollToForm(t: 'inquiry' | 'demo') {
    setTab(t);
    setTimeout(() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function submitIq(e: React.FormEvent) {
    e.preventDefault();
    addInquiry({ type: 'inquiry', ...iq });
    setIq({ name: '', email: '', company: '', message: '' });
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  }

  function submitDm(e: React.FormEvent) {
    e.preventDefault();
    if (!demoDate || !demoSlot) return;
    addInquiry({
      type: 'demo', ...dm,
      date: demoDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: demoSlot,
      duration: Number(dm.duration),
    });
    setDm({ name: '', email: '', company: '', topic: '', duration: '30' });
    setDemoDate(null); setDemoSlot(null);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  }

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";

  return (
    <main>
      <Nav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-[400px] w-[700px] rounded-full bg-[#FF6B61]/[0.07] blur-[130px]" />
        </div>

        <motion.div
          className="relative max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] text-white/60 text-sm rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B61] animate-pulse inline-block" />
            We respond within 1 business day
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white leading-[1.08] mb-6">
            {"Let's build your "}
            <span className="bg-gradient-to-r from-[#FF6B61] via-[#ff9a8b] to-[#ffc5b9] bg-clip-text text-transparent">
              SMB platform
            </span>
            {" together."}
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-7">
            Schedule a live demo or send us a question. Our team will walk you through everything
            — no pressure, no sales pitch.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => scrollToForm('demo')}
              className="bg-[#FF6B61] hover:bg-[#ff5244] text-white py-3 px-8 rounded-full font-semibold text-sm transition-colors"
            >
              Schedule a demo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => scrollToForm('inquiry')}
              className="bg-white/[0.07] border border-white/10 hover:bg-white/[0.1] text-white py-3 px-8 rounded-full font-semibold text-sm transition-colors"
            >
              Send an inquiry
            </motion.button>
          </div>

          {/* Integration pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {['Stripe Connect', 'Clerk Auth', 'MongoDB', 'Resend'].map((b) => (
              <span key={b} className="border border-white/[0.08] bg-white/[0.03] text-white/35 text-xs px-3 py-1.5 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── "What you get" feature cards ──────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.p
            className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] text-center mb-10"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What you get
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${w.color}`}>
                  {w.icon}
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{w.title}</h3>
                <p className="text-sm text-white/50 leading-6">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact form ──────────────────────────────────── */}
      <section id="contact-form" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Section label */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-3">Get in touch</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">How can we help?</h2>
          </motion.div>

          {/* Tab switcher */}
          <div className="flex gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1.5 mb-8">
            {(['inquiry', 'demo'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab === t ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="contact-tab"
                    className="absolute inset-0 bg-white/[0.08] rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {t === 'inquiry' ? '✉ Send Inquiry' : '📅 Schedule Demo'}
                </span>
              </button>
            ))}
          </div>

          {/* Form or success */}
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-12 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="font-semibold text-emerald-400 text-lg">
                  {tab === 'demo' ? 'Demo scheduled!' : 'Inquiry sent!'}
                </p>
                <p className="text-white/50 text-sm mt-2">
                  {"We'll be in touch within 1 business day."}
                </p>
              </motion.div>

            ) : tab === 'inquiry' ? (

              /* ── Inquiry form ───────────────────────────── */
              <motion.form
                key="inquiry"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                onSubmit={submitIq}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    required placeholder="Full name" value={iq.name}
                    onChange={(e) => setIq({ ...iq, name: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    required type="email" placeholder="Email address" value={iq.email}
                    onChange={(e) => setIq({ ...iq, email: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <input
                  placeholder="Company (optional)" value={iq.company}
                  onChange={(e) => setIq({ ...iq, company: e.target.value })}
                  className={inputCls}
                />
                <textarea
                  required rows={5} placeholder="What can we help you with?"
                  value={iq.message}
                  onChange={(e) => setIq({ ...iq, message: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-[#FF6B61] hover:bg-[#ff5244] text-white py-3 rounded-full font-semibold text-sm transition-colors"
                >
                  Send inquiry →
                </motion.button>
              </motion.form>

            ) : (

              /* ── Demo scheduling form ───────────────────── */
              <motion.form
                key="demo"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
                onSubmit={submitDm}
                className="space-y-4"
              >
                {/* Calendar */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setViewMo(new Date(yr, mo - 1, 1))}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <span className="text-sm font-semibold text-white">{MONTHS[mo]} {yr}</span>
                    <button
                      type="button"
                      onClick={() => setViewMo(new Date(yr, mo + 1, 1))}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-7 mb-1">
                    {DAYS.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-white/25 py-1">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: fDay }).map((_, i) => <div key={`p${i}`} />)}
                    {Array.from({ length: dNum }).map((_, i) => {
                      const day = i + 1;
                      const dis = isDis(day);
                      const sel = isSel(day);
                      const tod = isTod(day);
                      return (
                        <button
                          key={day} type="button" disabled={dis}
                          onClick={() => { setDemoDate(new Date(yr, mo, day)); setDemoSlot(null); }}
                          className={[
                            'aspect-square rounded-lg flex items-center justify-center text-xs transition-colors',
                            sel ? 'bg-[#FF6B61] text-white font-semibold' : '',
                            tod && !sel ? 'border border-[#FF6B61]/50 text-white' : '',
                            dis ? 'text-white/15 cursor-not-allowed' : '',
                            !dis && !sel && !tod ? 'text-white/60 hover:bg-white/[0.07] hover:text-white' : '',
                          ].join(' ')}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[11px] text-white/20 text-center">Weekdays only · Select a date to see available times</p>
                </div>

                {/* Time slots */}
                <AnimatePresence>
                  {demoDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
                    >
                      <p className="text-xs text-white/40 mb-3 font-medium">
                        {demoDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {TIMES.map((t) => (
                          <button
                            key={t} type="button"
                            onClick={() => setDemoSlot(t)}
                            className={`py-2 px-1 rounded-xl text-xs font-medium transition-colors text-center ${
                              demoSlot === t
                                ? 'bg-[#FF6B61] text-white'
                                : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Personal info */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    required placeholder="Full name" value={dm.name}
                    onChange={(e) => setDm({ ...dm, name: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    required type="email" placeholder="Email address" value={dm.email}
                    onChange={(e) => setDm({ ...dm, email: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <input
                  placeholder="Company (optional)" value={dm.company}
                  onChange={(e) => setDm({ ...dm, company: e.target.value })}
                  className={inputCls}
                />
                <select
                  required value={dm.topic}
                  onChange={(e) => setDm({ ...dm, topic: e.target.value })}
                  className={inputCls}
                >
                  <option value="" disabled>Select demo topic…</option>
                  {TOPICS.map((t) => <option key={t} value={t} className="bg-[#0d0d18]">{t}</option>)}
                </select>

                {/* Duration + CTA */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-white/40 shrink-0">Duration:</span>
                  {['30', '60'].map((d) => (
                    <button
                      key={d} type="button"
                      onClick={() => setDm({ ...dm, duration: d })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        dm.duration === d ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!demoDate || !demoSlot}
                    className={`ml-auto py-2.5 px-6 rounded-full text-sm font-semibold transition-colors ${
                      demoDate && demoSlot
                        ? 'bg-[#FF6B61] hover:bg-[#ff5244] text-white'
                        : 'bg-white/[0.05] text-white/25 cursor-not-allowed'
                    }`}
                  >
                    Confirm demo →
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  );
}
