"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: d } },
});

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const TODAY  = new Date(2026, 3, 3); // April 3, 2026

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  date: string;       // toKey format YYYY-MM-DD
  time: string;
  name: string;
  email: string;
  service: string;
  duration: number;   // minutes
  status: BookingStatus;
  notes?: string;
}

/* ─── Mock existing bookings ─────────────────────────────── */
const INITIAL_BOOKINGS: Booking[] = [
  { id: "b1", date: "2026-04-07", time: "10:00 AM", name: "Jane Doe",     email: "jane@example.com",  service: "Strategy Session",    duration: 60, status: "confirmed", notes: "Wants to discuss Stripe onboarding." },
  { id: "b2", date: "2026-04-09", time: "2:00 PM",  name: "Bob Smith",    email: "bob@example.com",   service: "Technical Consult",   duration: 30, status: "confirmed" },
  { id: "b3", date: "2026-04-09", time: "3:00 PM",  name: "Mike Torres",  email: "mike@example.com",  service: "Product Demo",        duration: 60, status: "pending" },
  { id: "b4", date: "2026-04-14", time: "11:00 AM", name: "Priya Patel",  email: "priya@example.com", service: "Strategy Session",    duration: 60, status: "confirmed" },
  { id: "b5", date: "2026-04-16", time: "1:00 PM",  name: "Chris Nguyen", email: "chris@example.com", service: "Technical Consult",   duration: 30, status: "pending", notes: "Has questions about MongoDB schema." },
  { id: "b6", date: "2026-04-21", time: "10:00 AM", name: "Sara Lee",     email: "sara@example.com",  service: "Product Demo",        duration: 30, status: "cancelled" },
];

const TIMES = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];
const SERVICES = ["Strategy Session","Product Demo","Technical Consult","Check-in Call","Onboarding Walkthrough"];

const STATUS_CLS: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  pending:   "bg-amber-400/10 text-amber-400 border-amber-400/20",
  cancelled: "bg-white/[0.04] text-white/25 border-white/[0.08]",
};

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [viewMo, setViewMo]     = useState(new Date(2026, 3, 1));
  const [selected, setSelected] = useState<Date | null>(null);
  const [newSlot, setNewSlot]   = useState<string | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", email: "", service: "", duration: "30", notes: "" });

  const yr   = viewMo.getFullYear();
  const mo   = viewMo.getMonth();
  const dNum = new Date(yr, mo + 1, 0).getDate();
  const fDay = new Date(yr, mo, 1).getDay();

  const todayKey    = toKey(TODAY);
  const selectedKey = selected ? toKey(selected) : null;

  /* dots for days with bookings */
  const bookedDays = new Set(bookings.filter((b) => b.status !== "cancelled").map((b) => b.date));

  function isDis(d: number) {
    const dt = new Date(yr, mo, d);
    return dt < new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  }

  /* bookings on selected day */
  const dayBookings = selectedKey
    ? bookings.filter((b) => b.date === selectedKey)
    : [];

  /* taken slots on selected day */
  const takenTimes = new Set(
    dayBookings.filter((b) => b.status !== "cancelled").map((b) => b.time)
  );

  /* upcoming confirmed bookings */
  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && b.date >= todayKey)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1))
    .slice(0, 5);

  function markStatus(id: string, status: BookingStatus) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  function addBooking() {
    if (!selected || !newSlot || !form.name || !form.email || !form.service) return;
    const booking: Booking = {
      id: Date.now().toString(36),
      date: toKey(selected),
      time: newSlot,
      name: form.name,
      email: form.email,
      service: form.service,
      duration: Number(form.duration),
      status: "confirmed",
      notes: form.notes || undefined,
    };
    setBookings((prev) => [...prev, booking]);
    setForm({ name: "", email: "", service: "", duration: "30", notes: "" });
    setNewSlot(null);
    setShowForm(false);
  }

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-xl font-semibold text-white">Calendar</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage appointments your customers book through your app.
        </p>
      </motion.div>

      {/* Summary row */}
      <motion.div
        variants={fade(0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          { label: "Confirmed",  value: bookings.filter((b) => b.status === "confirmed").length,  color: "text-emerald-400" },
          { label: "Pending",    value: bookings.filter((b) => b.status === "pending").length,    color: "text-amber-400" },
          { label: "Cancelled",  value: bookings.filter((b) => b.status === "cancelled").length,  color: "text-white/30" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-1.5">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: calendar + day detail */}
        <div className="space-y-5">

          {/* Calendar */}
          <motion.div
            variants={fade(0.1)}
            initial="hidden"
            animate="visible"
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setViewMo(new Date(yr, mo - 1, 1))}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className="text-sm font-semibold text-white">{MONTHS[mo]} {yr}</span>
              <button
                onClick={() => setViewMo(new Date(yr, mo + 1, 1))}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => <div key={d} className="text-center text-xs font-medium text-white/25 py-1">{d}</div>)}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: fDay }).map((_, i) => <div key={`p${i}`} />)}
              {Array.from({ length: dNum }).map((_, i) => {
                const day    = i + 1;
                const dt     = new Date(yr, mo, day);
                const key    = toKey(dt);
                const dis    = isDis(day);
                const isTod  = key === todayKey;
                const isSel  = key === selectedKey;
                const hasBkg = bookedDays.has(key);
                return (
                  <button
                    key={day}
                    disabled={dis}
                    onClick={() => { setSelected(dt); setNewSlot(null); setShowForm(false); }}
                    className={[
                      "relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-colors",
                      isSel  ? "bg-[#FF6B61] text-white font-semibold" : "",
                      isTod && !isSel ? "border border-[#FF6B61]/50 text-white" : "",
                      dis     ? "text-white/15 cursor-not-allowed" : "",
                      !dis && !isSel && !isTod ? "text-white/60 hover:bg-white/[0.07] hover:text-white" : "",
                    ].join(" ")}
                  >
                    {day}
                    {hasBkg && !isSel && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-white/20 text-center mt-3">
              Green dots indicate days with bookings. Click a date to view or add appointments.
            </p>
          </motion.div>

          {/* Day detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </h3>
                    <p className="text-xs text-white/35 mt-0.5">
                      {dayBookings.filter((b) => b.status !== "cancelled").length} appointment(s)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 text-xs bg-[#FF6B61]/10 text-[#FF6B61] border border-[#FF6B61]/20 hover:bg-[#FF6B61]/20 px-3 py-1.5 rounded-xl font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add booking
                  </button>
                </div>

                {/* Existing bookings for the day */}
                {dayBookings.length === 0 && !showForm && (
                  <p className="text-sm text-white/30 text-center py-6">No bookings on this day. Click "Add booking" to create one.</p>
                )}
                <div className="space-y-2 mb-3">
                  {dayBookings.map((bk) => (
                    <div
                      key={bk.id}
                      className={`p-3.5 rounded-xl border ${bk.status === "cancelled" ? "opacity-40" : ""} ${
                        bk.status === "confirmed" ? "bg-emerald-400/[0.04] border-emerald-400/15" :
                        bk.status === "pending"   ? "bg-amber-400/[0.04] border-amber-400/15" :
                        "bg-white/[0.02] border-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{bk.name}</p>
                          <p className="text-xs text-white/40">{bk.email}</p>
                          <p className="text-xs text-white/35 mt-1">
                            {bk.time}  ·  {bk.service}  ·  {bk.duration} min
                          </p>
                          {bk.notes && <p className="text-xs text-white/30 mt-1 italic">"{bk.notes}"</p>}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_CLS[bk.status]}`}>
                          {bk.status}
                        </span>
                      </div>
                      {bk.status !== "cancelled" && (
                        <div className="flex gap-2 mt-2.5">
                          {bk.status === "pending" && (
                            <button
                              onClick={() => markStatus(bk.id, "confirmed")}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors font-medium"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => markStatus(bk.id, "cancelled")}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add booking inline form */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/[0.07] pt-4 mt-2 space-y-3">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">New booking</p>

                        {/* Time slot picker */}
                        <div>
                          <p className="text-xs text-white/30 mb-2">Select time slot</p>
                          <div className="flex flex-wrap gap-1.5">
                            {TIMES.map((t) => {
                              const taken = takenTimes.has(t);
                              return (
                                <button
                                  key={t}
                                  disabled={taken}
                                  onClick={() => setNewSlot(t)}
                                  className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                                    newSlot === t ? "bg-[#FF6B61] text-white" :
                                    taken ? "bg-white/[0.02] text-white/15 cursor-not-allowed line-through" :
                                    "bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white"
                                  }`}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="Customer name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={inputCls}
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <select
                          value={form.service}
                          onChange={(e) => setForm({ ...form, service: e.target.value })}
                          className={inputCls}
                        >
                          <option value="" disabled>Select service type…</option>
                          {SERVICES.map((s) => <option key={s} value={s} className="bg-[#0d0d18]">{s}</option>)}
                        </select>
                        <input
                          placeholder="Notes (optional)"
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          className={inputCls}
                        />

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/30 shrink-0">Duration:</span>
                          {["30", "60"].map((d) => (
                            <button
                              key={d}
                              onClick={() => setForm({ ...form, duration: d })}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.duration === d ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white/60"}`}
                            >
                              {d} min
                            </button>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={addBooking}
                            disabled={!newSlot || !form.name || !form.email || !form.service}
                            className={`ml-auto text-sm font-semibold px-5 py-2 rounded-xl transition-colors ${
                              newSlot && form.name && form.email && form.service
                                ? "bg-[#FF6B61] hover:bg-[#ff5244] text-white"
                                : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                            }`}
                          >
                            Confirm →
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: upcoming bookings */}
        <motion.div
          variants={fade(0.12)}
          initial="hidden"
          animate="visible"
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 h-fit"
        >
          <h2 className="text-sm font-semibold text-white mb-4">Upcoming appointments</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">No upcoming bookings.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((bk) => (
                <div
                  key={bk.id}
                  className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
                  onClick={() => {
                    const [y, m, d] = bk.date.split("-").map(Number);
                    setSelected(new Date(y, m - 1, d));
                    setViewMo(new Date(y, m - 1, 1));
                    setShowForm(false);
                    setNewSlot(null);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{bk.name}</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {new Date(bk.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        {" · "}{bk.time}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">{bk.service}  ·  {bk.duration} min</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_CLS[bk.status]}`}>
                      {bk.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-white/25 text-center leading-5">
              When your app is live, customers will book directly from your scheduling page and bookings will appear here instantly.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
