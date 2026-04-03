"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getTickets, replyToTicket, updateTicketStatus, updateTicketPriority, type Ticket, type TicketStatus, type TicketPriority, TICKET_EVENT } from "@/lib/tickets";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: d } },
});

/* ─── Static user data (mirrors admin/users/page.tsx) ─────── */
const USERS = [
  { id: 1, name: "Acme Corp",     email: "admin@acme.com",    plan: "Enterprise", status: "active",   revenue: 899, joined: "2025-11-12", lastActive: "2h ago",  smbs: 18 },
  { id: 2, name: "BuildFast Inc", email: "hi@buildfast.io",    plan: "Pro",        status: "active",   revenue: 299, joined: "2026-01-03", lastActive: "5m ago",  smbs: 7  },
  { id: 3, name: "PixelWave",     email: "dev@pixelwave.co",   plan: "Pro",        status: "active",   revenue: 299, joined: "2026-01-19", lastActive: "1d ago",  smbs: 4  },
  { id: 4, name: "NexaScale",     email: "info@nexascale.com", plan: "Starter",    status: "active",   revenue: 49,  joined: "2026-02-01", lastActive: "3h ago",  smbs: 2  },
  { id: 5, name: "CloudMint",     email: "ops@cloudmint.io",   plan: "Starter",    status: "trial",    revenue: 0,   joined: "2026-03-15", lastActive: "12h ago", smbs: 1  },
  { id: 6, name: "DataForge",     email: "team@dataforge.dev", plan: "Pro",        status: "active",   revenue: 299, joined: "2025-12-08", lastActive: "30m ago", smbs: 9  },
  { id: 7, name: "Tangent Labs",  email: "hello@tangent.dev",  plan: "Free",       status: "inactive", revenue: 0,   joined: "2026-03-28", lastActive: "6d ago",  smbs: 0  },
  { id: 8, name: "VeloApps",      email: "cto@veloapps.io",    plan: "Enterprise", status: "active",   revenue: 899, joined: "2025-10-22", lastActive: "1h ago",  smbs: 23 },
];

const PIPELINE_STAGES = [
  "Discovery Call",
  "Design Approval",
  "Development",
  "Testing & QA",
  "Launch",
  "Live & Growing",
];

/* Default per-user pipeline stage (index) — in production this comes from DB */
const DEFAULT_STAGE: Record<number, number> = { 1:3, 2:2, 3:4, 4:1, 5:0, 6:3, 7:0, 8:5 };

const PLAN_OPTIONS = ["Free", "Starter", "Pro", "Enterprise"];
const STATUS_OPTIONS = ["active", "trial", "inactive", "suspended"];

const STATUS_CLS: Record<string, string> = {
  open:        "text-[#FF6B61] bg-[#FF6B61]/10 border-[#FF6B61]/20",
  in_progress: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  resolved:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  closed:      "text-white/30 bg-white/[0.04] border-white/[0.08]",
};

const PRIORITY_CLS: Record<string, string> = {
  urgent: "text-red-400 bg-red-400/10 border-red-400/20",
  high:   "text-[#FF6B61] bg-[#FF6B61]/10 border-[#FF6B61]/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low:    "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = USERS.find((u) => u.id === Number(id));

  const [tickets, setTickets]           = useState<Ticket[]>([]);
  const [pipelineStage, setPipelineStage] = useState(DEFAULT_STAGE[Number(id)] ?? 0);
  const [plan, setPlan]                 = useState(user?.plan ?? "Free");
  const [accountStatus, setAccountStatus] = useState(user?.status ?? "inactive");
  const [activeTab, setActiveTab]       = useState<"overview" | "tickets" | "pipeline" | "notes">("overview");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText]       = useState<Record<string, string>>({});
  const [adminNote, setAdminNote]       = useState("");
  const [savedNote, setSavedNote]       = useState("");

  /* load + refresh tickets */
  function loadTickets() {
    setTickets(getTickets().filter((t) => t.userId === id));
  }
  useEffect(() => {
    loadTickets();
    window.addEventListener(TICKET_EVENT, loadTickets);
    return () => window.removeEventListener(TICKET_EVENT, loadTickets);
  }, [id]);

  if (!user) {
    return (
      <div className="px-8 py-8">
        <Link href="/admin/users" className="text-sm text-white/40 hover:text-white transition-colors">← Back to users</Link>
        <p className="text-white/40 mt-8">User not found.</p>
      </div>
    );
  }

  function sendReply(ticketId: string) {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    replyToTicket(ticketId, "admin", text);
    updateTicketStatus(ticketId, "in_progress");
    setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
  }

  const openCount     = tickets.filter((t) => t.status === "open").length;
  const unresolvedCount = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="flex items-center gap-2 text-xs text-white/30 mb-6">
        <Link href="/admin/users" className="hover:text-white transition-colors">Users</Link>
        <span>/</span>
        <span className="text-white/60">{user.name}</span>
      </motion.div>

      {/* Profile header */}
      <motion.div
        variants={fade(0.04)}
        initial="hidden"
        animate="visible"
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B61]/20 flex items-center justify-center text-[#FF6B61] font-bold text-lg shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{user.name}</h1>
              <p className="text-sm text-white/40">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-white/30">Joined {user.joined}</span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-white/30">Last active {user.lastActive}</span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-white/30">{user.smbs} SMBs</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Plan selector */}
            <div>
              <p className="text-[10px] text-white/25 mb-1">Plan</p>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.1] text-white text-xs font-medium rounded-xl px-3 py-1.5 outline-none"
              >
                {PLAN_OPTIONS.map((p) => <option key={p} value={p} className="bg-[#0d0d1a]">{p}</option>)}
              </select>
            </div>
            {/* Status selector */}
            <div>
              <p className="text-[10px] text-white/25 mb-1">Status</p>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.1] text-white text-xs font-medium rounded-xl px-3 py-1.5 outline-none capitalize"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0d0d1a]">{s}</option>)}
              </select>
            </div>
            <div className="self-end">
              <span className="text-xs font-semibold text-emerald-400">
                {user.revenue > 0 ? `$${user.revenue}/mo` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
          {[
            { label: "Pipeline stage", value: PIPELINE_STAGES[pipelineStage] ?? "—" },
            { label: "Open tickets",   value: openCount,        color: openCount > 0 ? "text-[#FF6B61]" : "text-white" },
            { label: "Unresolved",     value: unresolvedCount,  color: unresolvedCount > 0 ? "text-amber-400" : "text-white" },
            { label: "Monthly revenue",value: user.revenue > 0 ? `$${user.revenue}` : "—" },
          ].map(({ label, value, color = "text-white" }) => (
            <div key={label}>
              <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
              <p className={`text-sm font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fade(0.08)} initial="hidden" animate="visible" className="flex gap-1 mb-6">
        {(["overview", "tickets", "pipeline", "notes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-colors relative ${
              activeTab === t ? "text-white" : "text-white/35 hover:text-white/60"
            }`}
          >
            {activeTab === t && (
              <motion.div layoutId="admin-user-tab" className="absolute inset-0 bg-white/[0.08] rounded-xl" />
            )}
            <span className="relative">
              {t === "tickets" && unresolvedCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  Tickets
                  <span className="w-4 h-4 rounded-full bg-[#FF6B61] text-white text-[9px] font-bold flex items-center justify-center">{unresolvedCount}</span>
                </span>
              ) : t.charAt(0).toUpperCase() + t.slice(1)}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Pipeline snapshot */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Development Pipeline</h2>
                <button onClick={() => setActiveTab("pipeline")} className="text-xs text-[#FF6B61] hover:text-[#ff9a8b] transition-colors font-medium">Edit →</button>
              </div>
              <div className="flex items-center gap-0">
                {PIPELINE_STAGES.map((s, i) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all shrink-0 ${
                      i < pipelineStage ? "bg-emerald-400 border-emerald-400 text-white" :
                      i === pipelineStage ? "bg-[#FF6B61] border-[#FF6B61] text-white ring-4 ring-[#FF6B61]/20" :
                      "bg-transparent border-white/15 text-white/20"
                    }`}>
                      {i < pipelineStage ? <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < pipelineStage ? "bg-emerald-400/60" : "bg-white/[0.06]"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex mt-2">
                {PIPELINE_STAGES.map((s, i) => (
                  <div key={s} className="flex-1 text-center">
                    <p className={`text-[9px] leading-tight ${i === pipelineStage ? "text-[#FF6B61] font-semibold" : i < pipelineStage ? "text-emerald-400/70" : "text-white/20"}`}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent tickets */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Recent Tickets</h2>
                <button onClick={() => setActiveTab("tickets")} className="text-xs text-[#FF6B61] hover:text-[#ff9a8b] transition-colors font-medium">View all →</button>
              </div>
              {tickets.length === 0 ? (
                <p className="text-sm text-white/30 py-4 text-center">No tickets yet from this user.</p>
              ) : (
                <div className="space-y-2">
                  {tickets.slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">{t.subject}</p>
                        <p className="text-xs text-white/30 mt-0.5">{t.category} · {new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${PRIORITY_CLS[t.priority]}`}>{t.priority}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_CLS[t.status]}`}>{t.status.replace("_"," ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TICKETS */}
        {activeTab === "tickets" && (
          <motion.div key="tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {tickets.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-10 text-center">
                <p className="text-sm text-white/30">No support tickets from this user yet.</p>
                <p className="text-xs text-white/20 mt-1">When they submit a ticket from their dashboard, it will appear here.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                  {/* Ticket header */}
                  <button
                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                    className="w-full flex items-start justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {ticket.category} · {ticket.messages.length} message{ticket.messages.length !== 1 ? "s" : ""} · {new Date(ticket.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_CLS[ticket.priority]}`}>{ticket.priority}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CLS[ticket.status]}`}>{ticket.status.replace("_", " ")}</span>
                      <svg className={`w-4 h-4 text-white/30 transition-transform ${expandedTicket === ticket.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </button>

                  {/* Ticket expanded */}
                  <AnimatePresence>
                    {expandedTicket === ticket.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.06] px-5 pb-5 pt-4">
                          {/* Status + priority controls */}
                          <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-white/[0.05]">
                            <div>
                              <p className="text-[10px] text-white/25 mb-1">Status</p>
                              <div className="flex gap-1">
                                {(["open", "in_progress", "resolved", "closed"] as TicketStatus[]).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => updateTicketStatus(ticket.id, s)}
                                    className={`text-[10px] px-2.5 py-1 rounded-lg font-medium capitalize transition-colors ${
                                      ticket.status === s ? "bg-white/[0.12] text-white" : "text-white/30 hover:text-white/60"
                                    }`}
                                  >
                                    {s.replace("_", " ")}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/25 mb-1">Priority</p>
                              <div className="flex gap-1">
                                {(["low", "medium", "high", "urgent"] as TicketPriority[]).map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => updateTicketPriority(ticket.id, p)}
                                    className={`text-[10px] px-2.5 py-1 rounded-lg font-medium capitalize transition-colors ${
                                      ticket.priority === p ? "bg-white/[0.12] text-white" : "text-white/30 hover:text-white/60"
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Message thread */}
                          <div className="space-y-3 mb-4">
                            {ticket.messages.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                  msg.from === "admin"
                                    ? "bg-[#FF6B61]/15 border border-[#FF6B61]/20"
                                    : "bg-white/[0.05] border border-white/[0.08]"
                                }`}>
                                  <p className="text-xs font-semibold mb-0.5 ${msg.from === 'admin' ? 'text-[#FF6B61]' : 'text-white/50'}">
                                    {msg.from === "admin" ? "You (Anthony)" : user.name}
                                  </p>
                                  <p className="text-sm text-white/80 leading-relaxed">{msg.text}</p>
                                  <p className="text-[10px] text-white/20 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Reply box */}
                          {ticket.status !== "closed" && (
                            <div className="flex gap-2">
                              <input
                                placeholder="Type a reply…"
                                value={replyText[ticket.id] ?? ""}
                                onChange={(e) => setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply(ticket.id)}
                                className={`${inputCls} flex-1`}
                              />
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => sendReply(ticket.id)}
                                disabled={!replyText[ticket.id]?.trim()}
                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                  replyText[ticket.id]?.trim()
                                    ? "bg-[#FF6B61] hover:bg-[#ff5244] text-white"
                                    : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                                }`}
                              >
                                Reply
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* PIPELINE */}
        {activeTab === "pipeline" && (
          <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-2">Update Development Stage</h2>
              <p className="text-xs text-white/35 mb-6">Changes here reflect in the user's dashboard pipeline view.</p>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage, i) => (
                  <button
                    key={stage}
                    onClick={() => setPipelineStage(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      i === pipelineStage
                        ? "border-[#FF6B61]/40 bg-[#FF6B61]/8"
                        : i < pipelineStage
                        ? "border-emerald-400/25 bg-emerald-400/4"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                      i < pipelineStage ? "bg-emerald-400 border-emerald-400 text-white" :
                      i === pipelineStage ? "bg-[#FF6B61] border-[#FF6B61] text-white ring-4 ring-[#FF6B61]/20" :
                      "bg-transparent border-white/15 text-white/25"
                    }`}>
                      {i < pipelineStage
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                        : i + 1
                      }
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${i === pipelineStage ? "text-[#FF6B61]" : i < pipelineStage ? "text-emerald-400" : "text-white/40"}`}>{stage}</p>
                      <p className="text-xs text-white/25 mt-0.5">
                        {i < pipelineStage ? "Completed" : i === pipelineStage ? "Currently active" : "Not started"}
                      </p>
                    </div>
                    {i === pipelineStage && (
                      <span className="text-[10px] bg-[#FF6B61]/15 text-[#FF6B61] font-semibold px-2.5 py-1 rounded-full border border-[#FF6B61]/20">Active</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/20 mt-4 italic">* In production, pipeline stage is stored in MongoDB and synced in real time with the user&apos;s dashboard.</p>
            </div>
          </motion.div>
        )}

        {/* NOTES */}
        {activeTab === "notes" && (
          <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-1">Internal Notes</h2>
              <p className="text-xs text-white/35 mb-5">Private notes about this account. Not visible to the user.</p>
              <textarea
                rows={8}
                placeholder="Add notes about this client — project details, meeting recaps, follow-ups, etc."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className={`${inputCls} resize-none mb-3`}
              />
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSavedNote(adminNote); }}
                  disabled={!adminNote.trim()}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    adminNote.trim() ? "bg-[#FF6B61] hover:bg-[#ff5244] text-white" : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                  }`}
                >
                  Save note
                </motion.button>
                {savedNote && adminNote === savedNote && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    Saved
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
