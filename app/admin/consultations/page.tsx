"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const TODAY  = new Date();

const TIMES = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];
const TOPICS = [
  "Stripe Connect Setup",
  "Clerk Auth Configuration",
  "MongoDB Schema Design",
  "Resend Email Integration",
  "Custom Integration",
  "General Consultation",
  "Onboarding",
  "Support Call",
];

type ConsultationStatus = "scheduled" | "completed" | "cancelled";

interface Consultation {
  id: string;
  name: string;
  email: string;
  company: string;
  date: string;   // "Apr 7, 2026"
  time: string;   // "10:00 AM"
  topic: string;
  notes: string;
  duration: number;
  status: ConsultationStatus;
}

interface ClientOption {
  name: string;
  email: string;
  plan: string;
}

const STATUS_CLS: Record<ConsultationStatus, string> = {
  scheduled: "bg-sky-400/10 text-sky-400 border-sky-400/20",
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  cancelled: "bg-white/[0.04] text-white/25 border-white/[0.08]",
};

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseToKey(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "" : toKey(d);
}

function to24h(t: string) {
  const h12 = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!h12) return t;
  let hh = Number(h12[1]);
  const mm = Number(h12[2]);
  if (h12[3].toUpperCase() === "AM" && hh === 12) hh = 0;
  if (h12[3].toUpperCase() === "PM" && hh !== 12) hh += 12;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function classifyTime(dateStr: string, timeStr: string): "past" | "present" | "future" {
  const combined = new Date(`${dateStr} ${timeStr}`);
  if (isNaN(combined.getTime())) return "past";
  const todayStart = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86400000);
  if (combined >= todayEnd) return "future";
  if (combined >= todayStart) return "present";
  return "past";
}

// ── Card component ────────────────────────────────────────────────────────────
interface CardProps {
  c: Consultation;
  showActions?: boolean;
  onStatusChange?: (id: string, status: ConsultationStatus) => void;
}
function ConsultationCard({ c, showActions, onStatusChange }: CardProps) {
  return (
    <div
      className={`p-3.5 rounded-xl border ${
        c.status === "scheduled" ? "bg-sky-400/[0.04] border-sky-400/15" :
        c.status === "completed" ? "bg-emerald-400/[0.04] border-emerald-400/15" :
        "bg-white/[0.02] border-white/[0.07] opacity-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{c.name}</p>
          {c.company && <p className="text-xs text-white/35 truncate">{c.company}</p>}
          <p className="text-xs text-white/40 truncate">{c.email}</p>
          <p className="text-xs text-[#FF6B61] mt-1">{c.date} · {c.time} · {c.duration} min</p>
          <span className="mt-1.5 inline-block text-[11px] text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-full">
            {c.topic}
          </span>
          {c.notes && (
            <p className="text-[11px] text-white/30 mt-1 italic">&ldquo;{c.notes}&rdquo;</p>
          )}
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 capitalize ${STATUS_CLS[c.status]}`}>
          {c.status}
        </span>
      </div>
      {showActions && c.status === "scheduled" && onStatusChange && (
        <div className="flex gap-2 mt-2.5">
          <button
            onClick={() => onStatusChange(c.id, "completed")}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors font-medium"
          >
            Complete
          </button>
          <button
            onClick={() => onStatusChange(c.id, "cancelled")}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [clients, setClients]             = useState<ClientOption[]>([]);
  const [loading, setLoading]             = useState(true);

  const [viewMo, setViewMo]     = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);
  const [newSlot, setNewSlot]   = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);

  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", email: "", company: "", topic: "", notes: "", duration: "30",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_consultation_blocked");
      if (stored) {
        const { dates, slots } = JSON.parse(stored) as { dates: string[]; slots: string[] };
        if (Array.isArray(dates)) setBlockedDates(dates);
        if (Array.isArray(slots))  setBlockedSlots(slots);
      }
    } catch { /* ignore parse errors */ }

    Promise.all([
      fetch("/api/admin/consultations").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => null),
    ]).then(([cData, sData]) => {
      if (Array.isArray(cData)) setConsultations(cData);
      if (Array.isArray(sData?.recentClients)) {
        setClients(
          (sData.recentClients as ClientOption[]).filter(
            (c, i, a) => a.findIndex((x) => x.email === c.email) === i
          )
        );
      }
    }).finally(() => setLoading(false));
  }, []);

  // ── Calendar derived ──────────────────────────────────────────────────────
  const yr   = viewMo.getFullYear();
  const mo   = viewMo.getMonth();
  const dNum = new Date(yr, mo + 1, 0).getDate();
  const fDay = new Date(yr, mo, 1).getDay();

  const todayKey    = toKey(TODAY);
  const selectedKey = selected ? toKey(selected) : null;

  const consultationsByDate = useMemo(() => {
    const map: Record<string, Consultation[]> = {};
    for (const c of consultations) {
      const key = parseToKey(c.date);
      if (key) (map[key] ??= []).push(c);
    }
    return map;
  }, [consultations]);

  const bookedDaySet = useMemo(
    () => new Set(
      Object.entries(consultationsByDate)
        .filter(([, arr]) => arr.some((c) => c.status !== "cancelled"))
        .map(([k]) => k)
    ),
    [consultationsByDate]
  );

  const blockedDaySet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const dayConsultations = selectedKey ? (consultationsByDate[selectedKey] ?? []) : [];

  const takenTimes = useMemo(
    () => new Set(
      dayConsultations
        .filter((c) => c.status !== "cancelled")
        .map((c) => to24h(c.time))
    ),
    [dayConsultations]
  );

  const blockedTimesForDay = useMemo(() => {
    if (!selectedKey) return new Set<string>();
    return new Set(
      blockedSlots.filter((s) => s.startsWith(`${selectedKey}T`)).map((s) => s.slice(11))
    );
  }, [blockedSlots, selectedKey]);

  const isSelectedDayBlocked = !!selectedKey && blockedDaySet.has(selectedKey);

  // ── Block helpers ─────────────────────────────────────────────────────────
  function persistBlocks(dates: string[], slots: string[]) {
    localStorage.setItem("admin_consultation_blocked", JSON.stringify({ dates, slots }));
  }

  function toggleDayBlocked() {
    if (!selectedKey) return;
    const currently = blockedDaySet.has(selectedKey);
    const nextDates = currently ? blockedDates.filter((d) => d !== selectedKey) : [...blockedDates, selectedKey];
    const nextSlots = blockedSlots.filter((s) => !s.startsWith(`${selectedKey}T`));
    setBlockedDates(nextDates);
    setBlockedSlots(nextSlots);
    persistBlocks(nextDates, nextSlots);
    if (!currently && newSlot) setNewSlot(null);
  }

  function toggleSlotBlocked(slotLabel: string) {
    if (!selectedKey || isSelectedDayBlocked) return;
    const slot24 = to24h(slotLabel);
    const key    = `${selectedKey}T${slot24}`;
    const exists = blockedSlots.includes(key);
    const nextSlots = exists ? blockedSlots.filter((s) => s !== key) : [...blockedSlots, key];
    setBlockedSlots(nextSlots);
    persistBlocks(blockedDates, nextSlots);
    if (!exists && newSlot === slotLabel) setNewSlot(null);
  }

  // ── Client quick-fill ─────────────────────────────────────────────────────
  function applyClient(email: string) {
    const c = clients.find((cl) => cl.email === email);
    if (!c) return;
    setForm((f) => ({ ...f, name: c.name, email: c.email, company: "" }));
  }

  // ── Book ──────────────────────────────────────────────────────────────────
  async function book() {
    if (!selected || !newSlot || !form.name || !form.email || !form.topic) return;
    if (isSelectedDayBlocked || blockedTimesForDay.has(to24h(newSlot))) return;
    setSaving(true);
    const payload = {
      name:     form.name,
      email:    form.email,
      company:  form.company || undefined,
      date:     selected.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time:     newSlot,
      topic:    form.topic,
      notes:    form.notes || undefined,
      duration: Number(form.duration),
    };
    const res = await fetch("/api/admin/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    if (res?.ok) {
      const saved = await res.json().catch(() => null);
      if (saved) setConsultations((prev) => [saved, ...prev]);
    }
    setForm({ name: "", email: "", company: "", topic: "", notes: "", duration: "30" });
    setNewSlot(null);
    setShowForm(false);
    setSaving(false);
  }

  // ── Status update ─────────────────────────────────────────────────────────
  async function updateStatus(id: string, status: ConsultationStatus) {
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch(`/api/admin/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
  }

  // ── Timeline grouping ─────────────────────────────────────────────────────
  const future = consultations
    .filter((c) => c.status !== "cancelled" && classifyTime(c.date, c.time) === "future")
    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

  const present = consultations
    .filter((c) => c.status !== "cancelled" && classifyTime(c.date, c.time) === "present");

  const past = consultations
    .filter((c) => classifyTime(c.date, c.time) === "past")
    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
    .slice(0, 20);

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Consultations</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Schedule and manage client calls
          {loading && <span className="text-white/25"> · Loading…</span>}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Scheduled", value: consultations.filter((c) => c.status === "scheduled").length, color: "text-sky-400" },
          { label: "Completed", value: consultations.filter((c) => c.status === "completed").length, color: "text-emerald-400" },
          { label: "Cancelled", value: consultations.filter((c) => c.status === "cancelled").length, color: "text-white/30" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-1.5">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* ── Left: calendar + day detail ────────────────────────────────── */}
        <div className="space-y-5">

          {/* Calendar */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setViewMo(new Date(yr, mo - 1, 1))}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-white">{MONTHS[mo]} {yr}</span>
              <button
                onClick={() => setViewMo(new Date(yr, mo + 1, 1))}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
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
                const day   = i + 1;
                const dt    = new Date(yr, mo, day);
                const key   = toKey(dt);
                const dis   = dt < new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
                const isTod = key === todayKey;
                const isSel = key === selectedKey;
                return (
                  <button
                    key={day}
                    disabled={dis}
                    onClick={() => { setSelected(dt); setNewSlot(null); setShowForm(false); }}
                    className={[
                      "relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-colors",
                      isSel ? "bg-[#FF6B61] text-white font-semibold" : "",
                      isTod && !isSel ? "border border-[#FF6B61]/50 text-white" : "",
                      blockedDaySet.has(key) && !isSel ? "ring-1 ring-amber-400/50 text-amber-300" : "",
                      dis ? "text-white/15 cursor-not-allowed" : "",
                      !dis && !isSel && !isTod ? "text-white/60 hover:bg-white/[0.07] hover:text-white" : "",
                    ].join(" ")}
                  >
                    {day}
                    {bookedDaySet.has(key) && !isSel && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#FF6B61]/70" />
                    )}
                    {blockedDaySet.has(key) && !isSel && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-white/20 text-center mt-3">
              Dots = scheduled consultations · Amber ring = blocked day
            </p>
          </div>

          {/* Day detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key="day-detail"
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
                      {dayConsultations.filter((c) => c.status !== "cancelled").length} consultation(s)
                    </p>
                    {isSelectedDayBlocked && (
                      <p className="text-xs mt-1 text-amber-300/70">This day is blocked</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleDayBlocked}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors border ${
                        isSelectedDayBlocked
                          ? "bg-amber-400/15 text-amber-300 border-amber-400/30 hover:bg-amber-400/20"
                          : "bg-white/[0.04] text-white/70 border-white/[0.1] hover:bg-white/[0.08]"
                      }`}
                    >
                      {isSelectedDayBlocked ? "Unblock day" : "Block day"}
                    </button>
                    <button
                      onClick={() => setShowForm(!showForm)}
                      disabled={isSelectedDayBlocked}
                      className="flex items-center gap-1.5 text-xs bg-[#FF6B61]/10 text-[#FF6B61] border border-[#FF6B61]/20 hover:bg-[#FF6B61]/20 px-3 py-1.5 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Book
                    </button>
                  </div>
                </div>

                {dayConsultations.length === 0 && !showForm && (
                  <p className="text-sm text-white/30 text-center py-6">
                    No consultations on this day. Click &ldquo;Book&rdquo; to schedule one.
                  </p>
                )}
                <div className="space-y-2 mb-3">
                  {dayConsultations.map((c) => (
                    <ConsultationCard key={c.id} c={c} showActions onStatusChange={updateStatus} />
                  ))}
                </div>

                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/[0.07] pt-4 mt-2 space-y-3">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">New consultation</p>

                        {/* Time slot picker */}
                        <div>
                          <p className="text-xs text-white/30 mb-2">Select time slot</p>
                          <div className="flex flex-wrap gap-1.5">
                            {TIMES.map((t) => {
                              const slot24  = to24h(t);
                              const taken   = takenTimes.has(slot24);
                              const blocked = blockedTimesForDay.has(slot24) || isSelectedDayBlocked;
                              return (
                                <div key={t} className="flex items-center gap-1">
                                  <button
                                    disabled={taken || blocked}
                                    onClick={() => setNewSlot(t)}
                                    className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                                      newSlot === t ? "bg-[#FF6B61] text-white" :
                                      blocked ? "bg-amber-400/10 text-amber-300/50 cursor-not-allowed line-through" :
                                      taken   ? "bg-white/[0.02] text-white/15 cursor-not-allowed line-through" :
                                      "bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white"
                                    }`}
                                  >
                                    {t}
                                  </button>
                                  <button
                                    onClick={() => toggleSlotBlocked(t)}
                                    disabled={taken || isSelectedDayBlocked}
                                    className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                                      blockedTimesForDay.has(slot24)
                                        ? "bg-amber-400/15 text-amber-300 border-amber-400/30 hover:bg-amber-400/20"
                                        : "bg-white/[0.03] text-white/35 border-white/[0.08] hover:text-white/60"
                                    } disabled:opacity-35 disabled:cursor-not-allowed`}
                                  >
                                    {blockedTimesForDay.has(slot24) ? "Unblock" : "Block"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Client quick-fill */}
                        {clients.length > 0 && (
                          <select
                            defaultValue=""
                            onChange={(e) => applyClient(e.target.value)}
                            className={inputCls}
                          >
                            <option value="">Select existing client to autofill…</option>
                            {clients.map((cl) => (
                              <option key={cl.email} value={cl.email} className="bg-[#0d0d18]">
                                {cl.name} · {cl.plan}
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="Full name *"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={inputCls}
                          />
                          <input
                            type="email"
                            placeholder="Email address *"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <input
                          placeholder="Company (optional)"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className={inputCls}
                        />
                        <select
                          value={form.topic}
                          onChange={(e) => setForm({ ...form, topic: e.target.value })}
                          className={inputCls}
                        >
                          <option value="" disabled>Select topic *</option>
                          {TOPICS.map((t) => (
                            <option key={t} value={t} className="bg-[#0d0d18]">{t}</option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Notes / agenda (optional)"
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          rows={2}
                          className={`${inputCls} resize-none`}
                        />

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/30 shrink-0">Duration:</span>
                          {["30", "60", "90"].map((d) => (
                            <button
                              key={d}
                              onClick={() => setForm({ ...form, duration: d })}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                form.duration === d ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white/60"
                              }`}
                            >
                              {d} min
                            </button>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={book}
                            disabled={!newSlot || !form.name || !form.email || !form.topic || saving}
                            className={`ml-auto text-sm font-semibold px-5 py-2 rounded-xl transition-colors ${
                              newSlot && form.name && form.email && form.topic && !saving
                                ? "bg-[#FF6B61] hover:bg-[#ff5244] text-white"
                                : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                            }`}
                          >
                            {saving ? "Saving…" : "Confirm →"}
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

        {/* ── Right: Past / Present / Future ─────────────────────────────── */}
        <div className="space-y-6">

          {/* Today */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
              Today
              {present.length > 0 && <span className="ml-1.5 text-[#FF6B61]">· {present.length}</span>}
            </p>
            {present.length === 0 ? (
              <p className="text-xs text-white/25 py-3 text-center">No consultations today.</p>
            ) : (
              <div className="space-y-2">
                {present.map((c) => (
                  <ConsultationCard key={c.id} c={c} showActions onStatusChange={updateStatus} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
              Upcoming <span className="ml-1 text-white/20">· {future.length}</span>
            </p>
            {future.length === 0 ? (
              <p className="text-xs text-white/25 py-3 text-center">No upcoming consultations.</p>
            ) : (
              <div className="space-y-2">
                {future.map((c) => (
                  <ConsultationCard key={c.id} c={c} showActions onStatusChange={updateStatus} />
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
                Past <span className="ml-1 text-white/20">· {past.length}</span>
              </p>
              <div className="space-y-2">
                {past.map((c) => (
                  <ConsultationCard key={c.id} c={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
