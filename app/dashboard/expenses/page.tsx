"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: d } },
});

type ExpenseCategory =
  | "rent" | "utilities" | "software" | "payroll" | "marketing"
  | "supplies" | "travel" | "food" | "insurance" | "equipment"
  | "professional_services" | "other";

type ExpenseRecurrence = "one_time" | "weekly" | "monthly" | "annual";

interface Expense {
  _id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  vendor?: string;
  date: string;
  recurrence: ExpenseRecurrence;
  taxDeductible: boolean;
  notes?: string;
  createdAt: string;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "rent",                 label: "Rent / Lease" },
  { value: "utilities",            label: "Utilities" },
  { value: "software",             label: "Software & Subscriptions" },
  { value: "payroll",              label: "Payroll" },
  { value: "marketing",            label: "Marketing & Ads" },
  { value: "supplies",             label: "Supplies & Materials" },
  { value: "travel",               label: "Travel" },
  { value: "food",                 label: "Meals & Entertainment" },
  { value: "insurance",            label: "Insurance" },
  { value: "equipment",            label: "Equipment" },
  { value: "professional_services", label: "Professional Services" },
  { value: "other",                label: "Other" },
];

const RECURRENCE_LABELS: Record<ExpenseRecurrence, string> = {
  one_time: "One-time",
  weekly:   "Weekly",
  monthly:  "Monthly",
  annual:   "Annual",
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  rent:                  "text-violet-400 bg-violet-400/10 border-violet-400/20",
  utilities:             "text-blue-400 bg-blue-400/10 border-blue-400/20",
  software:              "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  payroll:               "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  marketing:             "text-[#FF6B61] bg-[#FF6B61]/10 border-[#FF6B61]/20",
  supplies:              "text-amber-400 bg-amber-400/10 border-amber-400/20",
  travel:                "text-sky-400 bg-sky-400/10 border-sky-400/20",
  food:                  "text-orange-400 bg-orange-400/10 border-orange-400/20",
  insurance:             "text-teal-400 bg-teal-400/10 border-teal-400/20",
  equipment:             "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  professional_services: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  other:                 "text-white/40 bg-white/5 border-white/10",
};

const CATEGORY_LABEL: Record<ExpenseCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
) as Record<ExpenseCategory, string>;

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const today = () => new Date().toISOString().slice(0, 10);

const BLANK = {
  amount: "" as unknown as number,
  category: "software" as ExpenseCategory,
  description: "",
  vendor: "",
  date: today(),
  recurrence: "one_time" as ExpenseRecurrence,
  taxDeductible: false,
  notes: "",
};

export default function ExpensesPage() {
  const [expenses, setExpenses]         = useState<Expense[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<Expense | null>(null);
  const [form, setForm]                 = useState({ ...BLANK });
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all");
  const [filterMonth, setFilterMonth]   = useState<string>("all");
  const [filterTax, setFilterTax]       = useState<"all" | "deductible" | "non">("all");

  useEffect(() => {
    fetch("/api/me/expenses")
      .then((r) => r.json())
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  const months = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => set.add(e.date.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filterCategory !== "all" && e.category !== filterCategory) return false;
      if (filterMonth !== "all" && !e.date.startsWith(filterMonth)) return false;
      if (filterTax === "deductible" && !e.taxDeductible) return false;
      if (filterTax === "non" && e.taxDeductible) return false;
      return true;
    });
  }, [expenses, filterCategory, filterMonth, filterTax]);

  // Summary stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth    = expenses.filter((e) => e.date.startsWith(currentMonth));
  const thisYear     = expenses.filter((e) => e.date.startsWith(new Date().getFullYear().toString()));

  const totalMonth   = thisMonth.reduce((s, e) => s + e.amount, 0);
  const totalYear    = thisYear.reduce((s, e)  => s + e.amount, 0);
  const totalTaxDed  = thisYear.filter((e) => e.taxDeductible).reduce((s, e) => s + e.amount, 0);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    thisYear.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [thisYear]);

  const maxCatAmount = byCategory[0]?.[1] ?? 1;

  function openAdd() {
    setEditTarget(null);
    setForm({ ...BLANK, date: today() });
    setShowModal(true);
  }

  function openEdit(e: Expense) {
    setEditTarget(e);
    setForm({
      amount: e.amount,
      category: e.category,
      description: e.description,
      vendor: e.vendor ?? "",
      date: e.date,
      recurrence: e.recurrence,
      taxDeductible: e.taxDeductible,
      notes: e.notes ?? "",
    });
    setShowModal(true);
  }

  async function submitForm() {
    if (!form.amount || !form.description.trim() || !form.date) return;
    setSaving(true);

    const payload = {
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      vendor: form.vendor?.trim() || undefined,
      date: form.date,
      recurrence: form.recurrence,
      taxDeductible: form.taxDeductible,
      notes: form.notes?.trim() || undefined,
    };

    if (editTarget) {
      const res = await fetch(`/api/me/expenses/${editTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setExpenses((prev) => prev.map((e) => (e._id === editTarget._id ? { ...e, ...updated } : e)));
    } else {
      const res = await fetch("/api/me/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setExpenses((prev) => [created, ...prev]);
    }

    setSaving(false);
    setShowModal(false);
  }

  async function deleteExpense(id: string) {
    if (!window.confirm("Delete this expense?")) return;
    setDeleting(id);
    await fetch(`/api/me/expenses/${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    setDeleting(null);
  }

  function exportCSV() {
    const header = ["Date", "Description", "Vendor", "Category", "Amount", "Recurrence", "Tax Deductible", "Notes"];
    const rows = filtered.map((e) => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${(e.vendor ?? "").replace(/"/g, '""')}"`,
      CATEGORY_LABEL[e.category],
      e.amount.toFixed(2),
      RECURRENCE_LABELS[e.recurrence],
      e.taxDeductible ? "Yes" : "No",
      `"${(e.notes ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";
  const labelCls = "text-[11px] text-white/40 mb-1 block";

  return (
    <div className="px-8 py-8 max-w-5xl">

      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Expenses</h1>
          <p className="text-sm text-white/35 mt-0.5">Track operating costs, manage budgets, and prepare for taxes</p>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportCSV}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Export CSV
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FF6B61] hover:bg-[#ff5244] text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Add Expense
          </motion.button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fade(0.05)} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "This Month", value: fmt(totalMonth), sub: `${thisMonth.length} expense${thisMonth.length !== 1 ? "s" : ""}` },
          { label: "This Year",  value: fmt(totalYear),  sub: `${thisYear.length} transactions` },
          { label: "Tax Deductible (YTD)", value: fmt(totalTaxDed), sub: `${thisYear.filter((e) => e.taxDeductible).length} qualifying expenses`, accent: true },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[11px] text-white/30 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent ? "text-emerald-400" : "text-white"} tracking-tight`}>{value}</p>
            <p className="text-[11px] text-white/25 mt-1">{sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <motion.div variants={fade(0.08)} initial="hidden" animate="visible" className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Top Categories This Year</h2>
          <div className="space-y-3">
            {byCategory.map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${CATEGORY_COLORS[cat as ExpenseCategory]}`}>
                  {CATEGORY_LABEL[cat as ExpenseCategory]}
                </span>
                <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6B61] rounded-full" style={{ width: `${(amt / maxCatAmount) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-white/60 shrink-0 tabular-nums">{fmt(amt)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={fade(0.1)} initial="hidden" animate="visible" className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white/60 outline-none focus:border-white/20 transition-colors"
        >
          <option value="all" className="bg-[#0d0d1a]">All months</option>
          {months.map((m) => (
            <option key={m} value={m} className="bg-[#0d0d1a]">
              {new Date(m + "-01").toLocaleString("en-US", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | "all")}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white/60 outline-none focus:border-white/20 transition-colors"
        >
          <option value="all" className="bg-[#0d0d1a]">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-[#0d0d1a]">{c.label}</option>
          ))}
        </select>

        <select
          value={filterTax}
          onChange={(e) => setFilterTax(e.target.value as "all" | "deductible" | "non")}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white/60 outline-none focus:border-white/20 transition-colors"
        >
          <option value="all" className="bg-[#0d0d1a]">Tax: all</option>
          <option value="deductible" className="bg-[#0d0d1a]">Tax deductible only</option>
          <option value="non" className="bg-[#0d0d1a]">Non-deductible only</option>
        </select>

        {(filterMonth !== "all" || filterCategory !== "all" || filterTax !== "all") && (
          <button onClick={() => { setFilterMonth("all"); setFilterCategory("all"); setFilterTax("all"); }}
            className="text-xs text-white/30 hover:text-white/60 transition-colors px-2">
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-white/25 self-center">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} · {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
        </span>
      </motion.div>

      {/* Expense list */}
      <motion.div variants={fade(0.12)} initial="hidden" animate="visible">
        {loading ? (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-10 text-center">
            <p className="text-sm text-white/30">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-12 text-center">
            <p className="text-sm text-white/40">
              {expenses.length === 0 ? "No expenses yet. Click \"Add Expense\" to get started." : "No expenses match the current filters."}
            </p>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Date", "Description", "Category", "Amount", "Recurrence", "Tax", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 text-xs text-white/40 tabular-nums whitespace-nowrap">
                      {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-sm text-white font-medium truncate">{e.description}</p>
                      {e.vendor && <p className="text-[11px] text-white/30 truncate">{e.vendor}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[e.category]}`}>
                        {CATEGORY_LABEL[e.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white tabular-nums whitespace-nowrap">
                      {fmt(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/35 whitespace-nowrap">
                      {RECURRENCE_LABELS[e.recurrence]}
                    </td>
                    <td className="px-4 py-3">
                      {e.taxDeductible ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">✓ Deductible</span>
                      ) : (
                        <span className="text-[10px] text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => deleteExpense(e._id)} disabled={deleting === e._id}
                          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">{editTarget ? "Edit Expense" : "Add Expense"}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/70 transition-colors p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Amount *</label>
                    <input
                      type="number" min="0.01" step="0.01" placeholder="0.00"
                      value={form.amount === 0 ? "" : form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Date *</label>
                    <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description *</label>
                  <input placeholder="e.g. Monthly Figma subscription" value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Category *</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
                      className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-[#0d0d1a]">{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Vendor</label>
                    <input placeholder="e.g. Figma Inc." value={form.vendor}
                      onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Recurrence</label>
                    <select value={form.recurrence} onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value as ExpenseRecurrence }))}
                      className={inputCls}>
                      {Object.entries(RECURRENCE_LABELS).map(([k, v]) => (
                        <option key={k} value={k} className="bg-[#0d0d1a]">{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-0.5">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div
                        onClick={() => setForm((f) => ({ ...f, taxDeductible: !f.taxDeductible }))}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${form.taxDeductible ? "bg-emerald-500" : "bg-white/[0.1]"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.taxDeductible ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                      <span className="text-xs text-white/50">Tax deductible</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea rows={2} placeholder="Optional notes about this expense"
                    value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className={`${inputCls} resize-none`} />
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={submitForm}
                  disabled={saving || !form.amount || !form.description.trim() || !form.date}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#FF6B61] hover:bg-[#ff5244] text-white transition-colors disabled:opacity-40">
                  {saving ? "Saving…" : editTarget ? "Save changes" : "Add expense"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
