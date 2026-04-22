"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types --------------------------------------------------------------------

type InquiryStatus  = "new" | "read" | "replied";
type TicketStatus   = "open" | "in_progress" | "resolved" | "closed";
type TicketCategory = "general" | "billing" | "technical" | "feature" | "urgent";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface InquiryReply {
  id: string;
  text: string;
  createdAt: string;
}

interface Inquiry {
  _id: string;
  type: "inquiry" | "demo";
  name: string;
  email: string;
  company: string;
  message?: string;
  date?: string;
  time?: string;
  topic?: string;
  duration?: number;
  status: InquiryStatus;
  replies?: InquiryReply[];
  createdAt: string;
}

interface TicketMessage {
  id: string;
  from: "user" | "admin";
  text: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  clientId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

// --- Constants ----------------------------------------------------------------

const INQUIRY_STATUS_COLOR: Record<InquiryStatus, string> = {
  new:     "bg-[#FF6B61]/15 text-[#FF6B61]",
  read:    "bg-blue-400/15 text-blue-400",
  replied: "bg-emerald-400/15 text-emerald-400",
};

const TYPE_COLOR = {
  inquiry: "bg-violet-400/15 text-violet-400",
  demo:    "bg-orange-400/15 text-orange-400",
};

const TICKET_STATUS_COLOR: Record<TicketStatus, string> = {
  open:        "bg-[#FF6B61]/15 text-[#FF6B61]",
  in_progress: "bg-amber-400/15 text-amber-400",
  resolved:    "bg-emerald-400/15 text-emerald-400",
  closed:      "bg-white/10 text-white/40",
};

const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  general:   "General",
  billing:   "Billing",
  technical: "Technical",
  feature:   "Feature",
  urgent:    "Urgent",
};

// --- Page --------------------------------------------------------------------

export default function InquiriesPage() {
  const [tab, setTab] = useState<"inquiries" | "tickets">("inquiries");

  // Inquiries state
  const [items,     setItems]     = useState<Inquiry[]>([]);
  const [iLoading,  setILoading]  = useState(true);
  const [typeF,     setTypeF]     = useState<"all" | "inquiry" | "demo">("all");
  const [statusF,   setStatusF]   = useState<"all" | InquiryStatus>("all");
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replying,  setReplying]  = useState<string | null>(null);

  // Tickets state
  const [tickets,   setTickets]   = useState<Ticket[]>([]);
  const [tLoading,  setTLoading]  = useState(true);
  const [tExpanded, setTExpanded] = useState<string | null>(null);
  const [tReply,    setTReply]    = useState<Record<string, string>>({});
  const [tSending,  setTSending]  = useState<string | null>(null);
  const [tStatusF,  setTStatusF]  = useState<"all" | TicketStatus>("all");

  const loadInquiries = useCallback(async () => {
    setILoading(true);
    try {
      const res = await fetch("/api/inquiries");
      if (res.ok) setItems(await res.json());
    } finally {
      setILoading(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setTLoading(true);
    try {
      const res = await fetch("/api/admin/tickets");
      if (res.ok) setTickets(await res.json());
    } finally {
      setTLoading(false);
    }
  }, []);

  useEffect(() => { loadInquiries(); }, [loadInquiries]);
  useEffect(() => { loadTickets();   }, [loadTickets]);

  // --- Inquiry actions -------------------------------------------------------

  async function mark(id: string, status: InquiryStatus) {
    await fetch(`/api/inquiries/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, status } : i));
  }

  async function sendReply(id: string) {
    const text = replyText[id]?.trim();
    if (!text) return;
    setReplying(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text }),
      });
      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [id]: "" }));
        await loadInquiries();
      }
    } finally {
      setReplying(null);
    }
  }

  // --- Ticket actions --------------------------------------------------------

  async function sendTicketReply(id: string) {
    const text = tReply[id]?.trim();
    if (!text) return;
    setTSending(id);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        setTReply((prev) => ({ ...prev, [id]: "" }));
        await loadTickets();
      }
    } finally {
      setTSending(null);
    }
  }

  async function updateTicketStatus(id: string, status: TicketStatus) {
    await fetch(`/api/admin/tickets/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTickets((prev) => prev.map((t) => t._id === id ? { ...t, status } : t));
  }

  // --- Derived ---------------------------------------------------------------

  const filteredInquiries = items.filter((i) =>
    (typeF   === "all" || i.type   === typeF) &&
    (statusF === "all" || i.status === statusF)
  );

  const filteredTickets = tickets.filter((t) =>
    tStatusF === "all" || t.status === tStatusF
  );

  const totalNew    = items.filter((i) => i.status === "new").length;
  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Inquiries & Tickets</h1>
        <p className="text-sm text-white/40 mt-1">Contact form submissions and client support requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit mb-8">
        {(["inquiries", "tickets"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize relative ${
              tab === t ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            {t}
            {t === "inquiries" && totalNew > 0 && (
              <span className="ml-1.5 text-[10px] bg-[#FF6B61] text-white rounded-full px-1.5 py-0.5 font-bold">
                {totalNew}
              </span>
            )}
            {t === "tickets" && openTickets > 0 && (
              <span className="ml-1.5 text-[10px] bg-amber-400 text-black rounded-full px-1.5 py-0.5 font-bold">
                {openTickets}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* -- INQUIRIES TAB --------------------------------------------------- */}
      {tab === "inquiries" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total",     value: items.length,                                    color: "text-white" },
              { label: "New",       value: totalNew,                                         color: "text-[#FF6B61]" },
              { label: "Inquiries", value: items.filter((i) => i.type === "inquiry").length, color: "text-violet-400" },
              { label: "Demos",     value: items.filter((i) => i.type === "demo").length,    color: "text-orange-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                <p className="text-xs text-white/40 mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
              {(["all", "inquiry", "demo"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeF(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    typeF === t ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {t === "all" ? "All types" : t}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
              {(["all", "new", "read", "replied"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusF(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    statusF === s ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {s === "all" ? "All statuses" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {iLoading ? (
            <div className="text-center py-20 text-white/30 text-sm">Loading...</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="text-3xl mb-3">?</div>
              <p className="text-white/40 text-sm">No inquiries yet.</p>
              <p className="text-white/20 text-xs mt-1">
                Share <span className="text-white/40">/contact</span> to start receiving submissions.
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              {filteredInquiries.map((item, idx) => {
                const isExpanded = expanded === item._id;
                return (
                  <div key={item._id} className={idx < filteredInquiries.length - 1 ? "border-b border-white/[0.06]" : ""}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : item._id)}
                      className="w-full text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLOR[item.type]}`}>
                          {item.type}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-white">{item.name}</span>
                          {item.company && (
                            <span className="text-sm text-white/40 ml-2">· {item.company}</span>
                          )}
                        </div>
                        <p className="hidden md:block flex-1 text-xs text-white/30 truncate max-w-[240px]">
                          {item.type === "inquiry" ? item.message?.slice(0, 80) : `${item.date} @ ${item.time}`}
                        </p>
                        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${INQUIRY_STATUS_COLOR[item.status]}`}>
                          {item.status}
                        </span>
                        <span className="shrink-0 text-xs text-white/25">
                          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <svg className={`shrink-0 w-3.5 h-3.5 text-white/25 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 bg-white/[0.02] border-t border-white/[0.06]">
                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-[11px] text-white/30 mb-1">Email</p>
                                <p className="text-sm text-white">{item.email}</p>
                              </div>
                              {item.company && (
                                <div>
                                  <p className="text-[11px] text-white/30 mb-1">Company</p>
                                  <p className="text-sm text-white">{item.company}</p>
                                </div>
                              )}
                              {item.type === "inquiry" && item.message && (
                                <div className="sm:col-span-2">
                                  <p className="text-[11px] text-white/30 mb-1">Message</p>
                                  <p className="text-sm text-white/80 leading-6">{item.message}</p>
                                </div>
                              )}
                              {item.type === "demo" && (
                                <>
                                  <div>
                                    <p className="text-[11px] text-white/30 mb-1">Requested date</p>
                                    <p className="text-sm text-white">{item.date} at {item.time}</p>
                                  </div>
                                  {item.topic && (
                                    <div>
                                      <p className="text-[11px] text-white/30 mb-1">Topic</p>
                                      <p className="text-sm text-white">{item.topic}</p>
                                    </div>
                                  )}
                                  {item.duration && (
                                    <div>
                                      <p className="text-[11px] text-white/30 mb-1">Duration</p>
                                      <p className="text-sm text-white">{item.duration} minutes</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Reply thread */}
                            {item.replies && item.replies.length > 0 && (
                              <div className="mb-4 space-y-2">
                                <p className="text-[11px] text-white/30 mb-2">Reply thread</p>
                                {item.replies.map((r) => (
                                  <div key={r.id} className="bg-emerald-400/5 border border-emerald-400/15 rounded-xl px-4 py-3">
                                    <p className="text-xs text-emerald-400 font-semibold mb-1">Admin reply</p>
                                    <p className="text-sm text-white/80 leading-6">{r.text}</p>
                                    <p className="text-[10px] text-white/25 mt-1">
                                      {new Date(r.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Status actions */}
                            <div className="flex gap-2 flex-wrap mb-4">
                              {item.status === "new" && (
                                <button onClick={() => mark(item._id, "read")} className="text-xs px-3 py-1.5 rounded-lg bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-colors font-medium">
                                  Mark as read
                                </button>
                              )}
                              {item.status !== "replied" && (
                                <button onClick={() => mark(item._id, "replied")} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors font-medium">
                                  Mark as replied
                                </button>
                              )}
                              {item.status !== "new" && (
                                <button onClick={() => mark(item._id, "new")} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/60 transition-colors font-medium">
                                  Reopen
                                </button>
                              )}
                            </div>

                            {/* Reply compose */}
                            <div>
                              <p className="text-[11px] text-white/30 mb-2">Send reply (recorded in thread)</p>
                              <div className="flex gap-2">
                                <textarea
                                  value={replyText[item._id] ?? ""}
                                  onChange={(e) => setReplyText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                                  placeholder="Write a reply..."
                                  rows={2}
                                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 resize-none"
                                />
                                <button
                                  onClick={() => sendReply(item._id)}
                                  disabled={replying === item._id || !replyText[item._id]?.trim()}
                                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-500/90 transition-colors disabled:opacity-40 self-end"
                                >
                                  {replying === item._id ? "..." : "Save reply"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* -- TICKETS TAB ----------------------------------------------------- */}
      {tab === "tickets" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total",       value: tickets.length,                                          color: "text-white" },
              { label: "Open",        value: tickets.filter((t) => t.status === "open").length,        color: "text-[#FF6B61]" },
              { label: "In Progress", value: tickets.filter((t) => t.status === "in_progress").length, color: "text-amber-400" },
              { label: "Resolved",    value: tickets.filter((t) => t.status === "resolved").length,    color: "text-emerald-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                <p className="text-xs text-white/40 mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit mb-6">
            {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setTStatusF(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tStatusF === s ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {s === "all" ? "All" : TICKET_STATUS_LABEL[s as TicketStatus]}
              </button>
            ))}
          </div>

          {tLoading ? (
            <div className="text-center py-20 text-white/30 text-sm">Loading...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="text-3xl mb-3">??</div>
              <p className="text-white/40 text-sm">No support tickets yet.</p>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              {filteredTickets.map((ticket, idx) => {
                const isExpanded = tExpanded === ticket._id;

                return (
                  <div key={ticket._id} className={idx < filteredTickets.length - 1 ? "border-b border-white/[0.06]" : ""}>
                    <button
                      onClick={() => setTExpanded(isExpanded ? null : ticket._id)}
                      className="w-full text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          ticket.priority === "urgent" ? "bg-[#FF6B61]" :
                          ticket.priority === "high"   ? "bg-amber-400" :
                          ticket.priority === "medium" ? "bg-blue-400" : "bg-white/20"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-white truncate block">{ticket.subject}</span>
                          <span className="text-xs text-white/30">{ticket.clientId}</span>
                        </div>
                        <span className="shrink-0 text-xs text-white/30">{ticket.messages.length} msg{ticket.messages.length !== 1 ? "s" : ""}</span>
                        <span className="hidden sm:block shrink-0 text-[10px] text-white/30">{CATEGORY_LABELS[ticket.category]}</span>
                        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${TICKET_STATUS_COLOR[ticket.status]}`}>
                          {TICKET_STATUS_LABEL[ticket.status]}
                        </span>
                        <span className="shrink-0 text-xs text-white/25">
                          {new Date(ticket.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <svg className={`shrink-0 w-3.5 h-3.5 text-white/25 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 bg-white/[0.02] border-t border-white/[0.06]">
                            {/* Message thread */}
                            <div className="space-y-3 mb-4">
                              {ticket.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                                    msg.from === "admin"
                                      ? "bg-[#FF6B61]/15 text-white rounded-br-sm"
                                      : "bg-white/[0.06] text-white/80 rounded-bl-sm"
                                  }`}>
                                    <p className={`text-[10px] font-semibold mb-1 uppercase tracking-wide ${msg.from === "admin" ? "text-[#FF6B61]/70" : "text-white/40"}`}>
                                      {msg.from === "admin" ? "SAGAH Support" : "Client"}
                                    </p>
                                    <p>{msg.text}</p>
                                    <p className="text-[10px] text-white/25 mt-1.5">
                                      {new Date(msg.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Status actions */}
                            <div className="flex gap-2 flex-wrap mb-4">
                              {ticket.status === "open" && (
                                <button onClick={() => updateTicketStatus(ticket._id, "in_progress")} className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-colors font-medium">
                                  Mark in progress
                                </button>
                              )}
                              {ticket.status !== "resolved" && ticket.status !== "closed" && (
                                <button onClick={() => updateTicketStatus(ticket._id, "resolved")} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors font-medium">
                                  Resolve
                                </button>
                              )}
                              {ticket.status === "resolved" && (
                                <button onClick={() => updateTicketStatus(ticket._id, "closed")} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/60 transition-colors font-medium">
                                  Close
                                </button>
                              )}
                              {(ticket.status === "resolved" || ticket.status === "closed") && (
                                <button onClick={() => updateTicketStatus(ticket._id, "open")} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/60 transition-colors font-medium">
                                  Reopen
                                </button>
                              )}
                            </div>

                            {/* Admin reply compose */}
                            {ticket.status !== "closed" && (
                              <div>
                                <p className="text-[11px] text-white/30 mb-2">Reply to client</p>
                                <div className="flex gap-2">
                                  <textarea
                                    value={tReply[ticket._id] ?? ""}
                                    onChange={(e) => setTReply((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                                    placeholder="Write a reply..."
                                    rows={2}
                                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 resize-none"
                                  />
                                  <button
                                    onClick={() => sendTicketReply(ticket._id)}
                                    disabled={tSending === ticket._id || !tReply[ticket._id]?.trim()}
                                    className="px-4 py-2 rounded-xl bg-[#FF6B61] text-white text-sm font-semibold hover:bg-[#FF6B61]/90 transition-colors disabled:opacity-40 self-end"
                                  >
                                    {tSending === ticket._id ? "..." : "Reply"}
                                  </button>
                                </div>
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
          )}
        </>
      )}
    </div>
  );
}
