"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TicketStatus   = "open" | "in_progress" | "resolved" | "closed";
type TicketCategory = "general" | "billing" | "technical" | "feature" | "urgent";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface TicketMessage {
  id: string;
  from: "user" | "admin";
  text: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLOR: Record<TicketStatus, string> = {
  open:        "bg-[#FF6B61]/15 text-[#FF6B61]",
  in_progress: "bg-amber-400/15 text-amber-400",
  resolved:    "bg-emerald-400/15 text-emerald-400",
  closed:      "bg-white/10 text-white/40",
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  low:    "text-white/40",
  medium: "text-blue-400",
  high:   "text-amber-400",
  urgent: "text-[#FF6B61]",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  general:   "General",
  billing:   "Billing",
  technical: "Technical",
  feature:   "Feature Request",
  urgent:    "Urgent",
};

const CATEGORIES: TicketCategory[] = ["general", "billing", "technical", "feature", "urgent"];
const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export default function SupportPage() {
  const [tickets,   setTickets]   = useState<Ticket[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending,   setSending]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    subject:  "",
    category: "general" as TicketCategory,
    priority: "medium" as TicketPriority,
    message:  "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) setTickets(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ subject: "", category: "general", priority: "medium", message: "" });
        setShowForm(false);
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply(ticketId: string) {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    setSending(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
        await load();
      }
    } finally {
      setSending(null);
    }
  }

  const open       = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const resolved   = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Support</h1>
          <p className="text-sm text-white/40 mt-1">Open a ticket and track your conversations with SAGAH</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl bg-[#FF6B61] text-white text-sm font-semibold hover:bg-[#FF6B61]/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>

      {/* New ticket form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-8"
          >
            <form
              onSubmit={submit}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-sm font-semibold text-white mb-2">New Support Ticket</h2>

              <div>
                <label className="text-[11px] text-white/40 mb-1 block">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Short summary of the issue"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-white/40 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TicketCategory }))}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-white/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0f0f18]">
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-white/40 mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TicketPriority }))}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-white/20"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="bg-[#0f0f18] capitalize">{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/40 mb-1 block">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue or question in detail…"
                  rows={4}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#FF6B61] text-white text-sm font-semibold hover:bg-[#FF6B61]/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Ticket"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-20 text-white/30 text-sm">Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <div className="text-3xl mb-3">🎫</div>
          <p className="text-white/40 text-sm">No support tickets yet.</p>
          <p className="text-white/20 text-xs mt-1">Click "New Ticket" to get help from the SAGAH team.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active tickets */}
          {open.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
                Active · {open.length}
              </h2>
              <TicketList
                tickets={open}
                expanded={expanded}
                setExpanded={setExpanded}
                replyText={replyText}
                setReplyText={setReplyText}
                sending={sending}
                onReply={sendReply}
              />
            </section>
          )}

          {/* Resolved tickets */}
          {resolved.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
                Resolved · {resolved.length}
              </h2>
              <TicketList
                tickets={resolved}
                expanded={expanded}
                setExpanded={setExpanded}
                replyText={replyText}
                setReplyText={setReplyText}
                sending={sending}
                onReply={sendReply}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function TicketList({
  tickets, expanded, setExpanded, replyText, setReplyText, sending, onReply,
}: {
  tickets: Ticket[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  replyText: Record<string, string>;
  setReplyText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  sending: string | null;
  onReply: (id: string) => void;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
      {tickets.map((ticket, idx) => {
        const isExpanded = expanded === ticket._id;
        const adminMessages = ticket.messages.filter((m) => m.from === "admin");
        const hasNewAdminMsg = adminMessages.length > 0;

        return (
          <div key={ticket._id} className={idx < tickets.length - 1 ? "border-b border-white/[0.06]" : ""}>
            {/* Row */}
            <button
              onClick={() => setExpanded(isExpanded ? null : ticket._id)}
              className="w-full text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Priority dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  ticket.priority === "urgent" ? "bg-[#FF6B61]" :
                  ticket.priority === "high"   ? "bg-amber-400" :
                  ticket.priority === "medium" ? "bg-blue-400" :
                  "bg-white/20"
                }`} />

                {/* Subject */}
                <span className="flex-1 text-sm font-medium text-white truncate">{ticket.subject}</span>

                {/* Admin reply indicator */}
                {hasNewAdminMsg && (
                  <span className="shrink-0 text-[10px] text-emerald-400 font-medium">
                    {adminMessages.length} {adminMessages.length === 1 ? "reply" : "replies"}
                  </span>
                )}

                {/* Category */}
                <span className="hidden sm:block shrink-0 text-[10px] text-white/30">
                  {CATEGORY_LABELS[ticket.category]}
                </span>

                {/* Status */}
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[ticket.status]}`}>
                  {STATUS_LABEL[ticket.status]}
                </span>

                {/* Date */}
                <span className="shrink-0 text-xs text-white/25">
                  {new Date(ticket.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>

                {/* Chevron */}
                <svg
                  className={`shrink-0 w-3.5 h-3.5 text-white/25 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Thread */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 bg-white/[0.02] border-t border-white/[0.06]">
                    {/* Message thread */}
                    <div className="space-y-3 mb-4">
                      {ticket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                              msg.from === "user"
                                ? "bg-[#FF6B61]/15 text-white rounded-br-sm"
                                : "bg-white/[0.06] text-white/80 rounded-bl-sm"
                            }`}
                          >
                            {msg.from === "admin" && (
                              <p className="text-[10px] text-white/40 font-semibold mb-1 uppercase tracking-wide">
                                SAGAH Support
                              </p>
                            )}
                            <p>{msg.text}</p>
                            <p className="text-[10px] text-white/25 mt-1.5">
                              {new Date(msg.createdAt).toLocaleString("en-US", {
                                month: "short", day: "numeric",
                                hour: "numeric", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply area — only for open/in-progress tickets */}
                    {(ticket.status === "open" || ticket.status === "in_progress") && (
                      <div className="flex gap-2">
                        <textarea
                          value={replyText[ticket._id] ?? ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({ ...prev, [ticket._id]: e.target.value }))
                          }
                          placeholder="Send a follow-up message…"
                          rows={2}
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 resize-none"
                        />
                        <button
                          onClick={() => onReply(ticket._id)}
                          disabled={sending === ticket._id || !replyText[ticket._id]?.trim()}
                          className="px-4 py-2.5 rounded-xl bg-[#FF6B61] text-white text-sm font-semibold hover:bg-[#FF6B61]/90 transition-colors disabled:opacity-40 shrink-0 self-end"
                        >
                          {sending === ticket._id ? "…" : "Send"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
