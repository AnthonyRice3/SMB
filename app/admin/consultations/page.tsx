"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM',  '1:30 PM',
  '2:00 PM',  '2:30 PM',  '3:00 PM',  '3:30 PM', '4:00 PM',
];

// Mock already-booked slots keyed by "YYYY-MM-DD"
// Removed — booked slots are now derived from live consultation data

const TOPICS = [
  'Stripe Connect Setup',
  'Clerk Auth Configuration',
  'MongoDB Schema Design',
  'Resend Email Integration',
  'Custom Integration',
  'General Consultation',
];

interface Consultation {
  id: string;
  name: string;
  company: string;
  date: string;
  time: string;
  topic: string;
  duration: number;
}

const TODAY = new Date();

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ConsultationsPage() {
  const [viewMonth, setViewMonth]   = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [selected, setSelected]     = useState<Date | null>(null);
  const [slot, setSlot]             = useState<string | null>(null);
  const [upcoming, setUpcoming]     = useState<Consultation[]>([]);
  const [submitted, setSubmitted]   = useState(false);
  const [form, setForm]             = useState({
    name: '', email: '', company: '', topic: '', notes: '', duration: '30',
  });

  useEffect(() => {
    fetch('/api/admin/consultations')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUpcoming(data); })
      .catch(() => null);
  }, []);

  // Derive booked slots from live consultation data
  const BOOKED_SLOTS = useMemo(() => {
    const map: Record<string, string[]> = {};
    upcoming.forEach((c) => {
      const parsed = new Date(c.date);
      if (!isNaN(parsed.getTime())) {
        const key = toKey(parsed);
        if (!map[key]) map[key] = [];
        map[key].push(c.time);
      }
    });
    return map;
  }, [upcoming]);

  const year      = viewMonth.getFullYear();
  const month     = viewMonth.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const firstDay  = new Date(year, month, 1).getDay();

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    return d < TODAY;
  };

  const isWeekend = (day: number) => {
    const dow = new Date(year, month, day).getDay();
    return dow === 0 || dow === 6;
  };

  const selectedKey  = selected ? toKey(selected) : '';
  const bookedSlots  = BOOKED_SLOTS[selectedKey] ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !slot || !form.name || !form.email || !form.topic) return;
    const dateStr = selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    fetch('/api/admin/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, email: form.email, company: form.company,
        date: dateStr, time: slot, topic: form.topic,
        notes: form.notes, duration: Number(form.duration),
      }),
    })
      .then((r) => r.json())
      .then((saved) => {
        setUpcoming((prev) => [saved, ...prev]);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setSelected(null);
          setSlot(null);
          setForm({ name: '', email: '', company: '', topic: '', notes: '', duration: '30' });
        }, 3000);
      })
      .catch(() => null);
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Consultations</h1>
        <p className="text-sm text-white/40 mt-0.5">Schedule and manage client calls</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Left column ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Calendar */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-white">{MONTHS[month]} {year}</span>
              <button
                onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-white/25 py-1">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`pad-${i}`} />)}
              {Array.from({ length: daysCount }).map((_, i) => {
                const day     = i + 1;
                const date    = new Date(year, month, day);
                const key     = toKey(date);
                const isToday = key === toKey(TODAY);
                const isSel   = selected ? key === toKey(selected) : false;
                const past    = isPast(day);
                const weekend = isWeekend(day);
                const hasDot  = !!BOOKED_SLOTS[key];

                return (
                  <button
                    key={day}
                    disabled={past || weekend}
                    onClick={() => { setSelected(date); setSlot(null); }}
                    className={[
                      'relative aspect-square rounded-xl flex items-center justify-center text-sm transition-colors',
                      isSel   ? 'bg-[#FF6B61] text-white font-semibold' : '',
                      isToday && !isSel ? 'border border-[#FF6B61]/50 text-white' : '',
                      past || weekend ? 'text-white/15 cursor-not-allowed' : '',
                      !past && !weekend && !isSel && !isToday ? 'text-white/60 hover:bg-white/[0.07] hover:text-white' : '',
                    ].join(' ')}
                  >
                    {day}
                    {hasDot && !isSel && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF6B61]/70" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-white/20 text-center">Weekends unavailable · Dots indicate existing bookings</p>
          </div>

          {/* Time slots */}
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key="slots"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
              >
                <h3 className="text-sm font-medium text-white mb-4">
                  Available slots —{' '}
                  {selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2">
                  {TIME_SLOTS.map((s) => {
                    const isBooked = bookedSlots.includes(s);
                    const isChosen = slot === s;
                    return (
                      <button
                        key={s}
                        disabled={isBooked}
                        onClick={() => setSlot(s)}
                        className={[
                          'py-2 px-1 rounded-xl text-xs font-medium transition-colors',
                          isBooked ? 'text-white/15 bg-white/[0.02] cursor-not-allowed line-through' : '',
                          isChosen ? 'bg-[#FF6B61] text-white' : '',
                          !isBooked && !isChosen ? 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white' : '',
                        ].join(' ')}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking form */}
          <AnimatePresence mode="wait">
            {selected && slot && !submitted && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-sm font-medium text-white">
                  Book for{' '}
                  {selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {slot}
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors w-full"
                  />
                  <input
                    required type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email address"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors w-full"
                  />
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Company (optional)"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors w-full"
                  />
                  <select
                    required value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-colors w-full"
                  >
                    <option value="" disabled>Select topic…</option>
                    {TOPICS.map((t) => (
                      <option key={t} value={t} className="bg-[#0d0d18]">{t}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes or agenda (optional)"
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors resize-none"
                />

                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <span className="text-xs text-white/40 self-center">Duration:</span>
                    {['30', '60'].map((d) => (
                      <button
                        key={d} type="button"
                        onClick={() => setForm({ ...form, duration: d })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          form.duration === d ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="ml-auto bg-[#FF6B61] hover:bg-[#ff5244] text-white py-2.5 px-6 rounded-full text-sm font-semibold transition-colors"
                  >
                    Confirm booking
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Success banner */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-6 text-center"
              >
                <p className="text-emerald-400 font-semibold text-sm">Consultation booked!</p>
                <p className="text-white/50 text-xs mt-1">Added to your upcoming consultations.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right column: upcoming ─────────────────── */}
        <div>
          <h2 className="text-sm font-medium text-white mb-4">
            Upcoming <span className="text-white/30 font-normal">— {upcoming.length} scheduled</span>
          </h2>
          <div className="space-y-3">
            {upcoming.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-white leading-tight">{c.name}</span>
                  <span className="text-xs text-white/30 shrink-0">{c.duration}min</span>
                </div>
                <p className="text-xs text-white/40">{c.company}</p>
                <p className="mt-2 text-xs text-[#FF6B61]">{c.date} · {c.time}</p>
                <span className="mt-2 inline-block text-xs text-white/40 bg-white/[0.05] px-2 py-0.5 rounded-full">
                  {c.topic}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
