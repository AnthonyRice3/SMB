"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: d } },
});

interface AppUser {
  _id: string;
  email: string;
  name: string;
  plan: string | null;
  lastSeenAt: string;
  firstSeenAt: string;
  pageViews: number;
  sessionCount: number;
  // message thread metadata
  lastText: string | null;
  lastFrom: "user" | "client" | null;
  lastAt: string | null;
  unreadCount: number;
  hasMessages: boolean;
  bookingsCount: number;
  upcomingServices: number;
  purchasesCount: number;
}

interface Message {
  _id: string;
  userEmail: string;
  userName: string;
  from: "user" | "client";
  text: string;
  read: boolean;
  createdAt: string;
}

interface ActivityItem {
  type: "service" | "product";
  source: "booking" | "purchase";
  id: string;
  title: string;
  subtitle: string;
  status: string;
  date?: string;
  time?: string;
  duration?: number;
  createdAt?: string;
  amount?: number;
  currency?: string;
}

interface UserActivity {
  past: ActivityItem[];
  present: ActivityItem[];
  future: ActivityItem[];
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

export default function UsersPage() {
  const [users, setUsers]             = useState<AppUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [activity, setActivity]       = useState<UserActivity>({ past: [], present: [], future: [] });
  const [reply, setReply]             = useState("");
  const [sending, setSending]         = useState(false);
  const [search, setSearch]           = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll users every 15 s
  useEffect(() => {
    loadUsers();
    const id = setInterval(loadUsers, 15000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadUsers() {
    try {
      const res = await fetch("/api/me/users");
      const data = await res.json();
      if (Array.isArray(data.users)) setUsers(data.users);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  async function openThread(email: string) {
    const selectedUser = users.find((u) => u.email === email);
    setActiveEmail(email);
    setThreadLoading(true);
    try {
      const q = new URLSearchParams({ userEmail: email });
      if (selectedUser?._id) q.set("userId", selectedUser._id);
      const res = await fetch(`/api/me/messages/thread?${q.toString()}`);
      const data = await res.json();
      if (Array.isArray(data.messages)) setMessages(data.messages);
      if (data.activity && typeof data.activity === "object") {
        setActivity({
          past: Array.isArray(data.activity.past) ? data.activity.past : [],
          present: Array.isArray(data.activity.present) ? data.activity.present : [],
          future: Array.isArray(data.activity.future) ? data.activity.future : [],
        });
      } else {
        setActivity({ past: [], present: [], future: [] });
      }
      // Clear unread badge locally
      setUsers((prev) =>
        prev.map((u) => u.email === email ? { ...u, unreadCount: 0 } : u)
      );
    } catch { /* silent */ }
    finally { setThreadLoading(false); }
  }

  async function sendReply() {
    if (!reply.trim() || !activeEmail) return;
    const active = users.find((u) => u.email === activeEmail);
    setSending(true);
    try {
      const res = await fetch("/api/me/messages/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: activeEmail,
          userName: active?.name ?? "User",
          text: reply.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newMsg: Message = {
          _id: data.messageId,
          userEmail: activeEmail,
          userName: active?.name ?? "User",
          from: "client",
          text: reply.trim(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        setUsers((prev) =>
          prev.map((u) =>
            u.email === activeEmail
              ? { ...u, lastText: reply.trim(), lastFrom: "client", lastAt: new Date().toISOString(), hasMessages: true }
              : u
          )
        );
        setReply("");
      }
    } catch { /* silent */ }
    finally { setSending(false); }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const totalUnread = users.reduce((s, u) => s + u.unreadCount, 0);
  const activeUser  = users.find((u) => u.email === activeEmail);

  return (
    <div className="px-8 py-8 h-full">
      {/* Header */}
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">Users</h1>
          {totalUnread > 0 && (
            <span className="text-[10px] font-bold bg-[#FF6B61] text-white px-2 py-0.5 rounded-full">
              {totalUnread} new
            </span>
          )}
        </div>
        <p className="text-sm text-white/40 mt-0.5">Track and message your app users</p>
      </motion.div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* User list */}
        <motion.div
          variants={fade(0.05)} initial="hidden" animate="visible"
          className="w-72 shrink-0 flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          {/* Search */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-white/20">
                  {users.length === 0
                    ? "No users yet. Users appear here once they register in your app."
                    : "No results."}
                </p>
              </div>
            ) : (
              <div>
                {filtered.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => openThread(u.email)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-white/[0.04] last:border-0 ${
                      activeEmail === u.email
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#FF6B61]/60 to-[#ff9a8b]/40 flex items-center justify-center shrink-0 text-[11px] font-bold text-white mt-0.5">
                      {initials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium text-white truncate">{u.name}</span>
                        <span className="text-[10px] text-white/30 shrink-0">
                          {u.lastAt ? timeAgo(u.lastAt) : timeAgo(u.lastSeenAt)}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 truncate mt-0.5">
                        {u.hasMessages
                          ? <>
                              {u.lastFrom === "client" && <span className="text-white/25">You: </span>}
                              {u.lastText}
                            </>
                          : u.email}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {u.upcomingServices > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-300/10 text-sky-300/80 border border-sky-300/20">
                            {u.upcomingServices} upcoming
                          </span>
                        )}
                        {u.bookingsCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-300/10 text-emerald-300/80 border border-emerald-300/20">
                            {u.bookingsCount} services
                          </span>
                        )}
                        {u.purchasesCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-300/10 text-amber-300/80 border border-amber-300/20">
                            {u.purchasesCount} products
                          </span>
                        )}
                      </div>
                    </div>
                    {u.unreadCount > 0 && (
                      <span className="shrink-0 mt-1 w-4 h-4 rounded-full bg-[#FF6B61] text-white text-[9px] font-bold flex items-center justify-center">
                        {u.unreadCount > 9 ? "9+" : u.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Message thread */}
        <motion.div
          variants={fade(0.1)} initial="hidden" animate="visible"
          className="flex-1 flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          {!activeEmail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-white/30">Select a user to view the conversation</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#FF6B61]/60 to-[#ff9a8b]/40 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  {initials(activeUser?.name ?? "")}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{activeUser?.name}</p>
                  <p className="text-xs text-white/30">{activeEmail}</p>
                </div>
                {/* User stats */}
                {activeUser && (
                  <div className="ml-auto flex items-center gap-3 text-[10px] text-white/30">
                    <span>{activeUser.pageViews} views</span>
                    <span>{activeUser.sessionCount} sessions</span>
                    {activeUser.plan && (
                      <span className="bg-white/[0.06] px-2 py-0.5 rounded-full text-white/50">
                        {activeUser.plan}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {threadLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                        <div className="h-10 w-48 bg-white/[0.04] rounded-2xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <p className="text-sm text-white/20">No messages yet.</p>
                    <p className="text-xs text-white/15">Send a message to start the conversation.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((m) => (
                      <motion.div
                        key={m._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            m.from === "client"
                              ? "bg-[#FF6B61] text-white rounded-br-md"
                              : "bg-white/[0.07] text-white/80 rounded-bl-md"
                          }`}
                        >
                          <p>{m.text}</p>
                          <p className={`text-[10px] mt-1 ${m.from === "client" ? "text-white/60" : "text-white/30"}`}>
                            {timeAgo(m.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div className="px-4 py-3 border-t border-white/[0.06]">
                <div className="flex items-end gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                    }}
                    placeholder="Type a reply... (Enter to send, Shift+Enter for newline)"
                    rows={2}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors resize-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    className="px-4 py-2.5 bg-[#FF6B61] hover:bg-[#ff8578] disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
                  >
                    {sending ? "..." : "Send"}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          variants={fade(0.13)} initial="hidden" animate="visible"
          className="w-80 shrink-0 flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Services & Products</h3>
            <p className="text-[11px] text-white/35 mt-0.5">Past, present, and future user activity</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {!activeEmail ? (
              <p className="text-xs text-white/25 text-center py-8">Select a user to view their service/product timeline.</p>
            ) : threadLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {[
                  { key: "future", label: "Future", items: activity.future, tone: "text-sky-300" },
                  { key: "present", label: "Present", items: activity.present, tone: "text-amber-300" },
                  { key: "past", label: "Past", items: activity.past, tone: "text-white/60" },
                ].map((group) => (
                  <div key={group.key}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${group.tone}`}>{group.label}</p>
                      <span className="text-[10px] text-white/30">{group.items.length}</span>
                    </div>

                    {group.items.length === 0 ? (
                      <p className="text-[11px] text-white/20 py-2">No {group.label.toLowerCase()} items.</p>
                    ) : (
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <div key={`${item.source}-${item.id}`} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-white truncate">{item.title}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/50 capitalize shrink-0">
                                {item.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/35 mt-0.5 truncate">{item.subtitle}</p>
                            <p className="text-[10px] text-white/25 mt-1 uppercase tracking-wide">{item.type === "service" ? "Service" : "Product"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

