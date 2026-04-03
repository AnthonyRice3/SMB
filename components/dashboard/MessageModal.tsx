"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addTicket, type TicketCategory, type TicketPriority } from "@/lib/tickets";
import { addInquiry } from "@/lib/inquiries";

interface Props {
  open: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "general",   label: "General question" },
  { value: "billing",   label: "Billing / payments" },
  { value: "technical", label: "Technical issue" },
  { value: "feature",   label: "Feature request" },
  { value: "urgent",    label: "Urgent — needs attention" },
];

export default function MessageModal({ open, onClose, userId = "guest", userName = "", userEmail = "" }: Props) {
  const [tab, setTab]         = useState<"message" | "ticket">("message");
  const [name, setName]       = useState(userName);
  const [email, setEmail]     = useState(userEmail);
  const [subject, setSubject] = useState("");
  const [body, setBody]       = useState("");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [sent, setSent]       = useState(false);

  function submit() {
    if (!name || !email || !body) return;
    if (tab === "ticket") {
      addTicket({
        userId,
        userName:  name,
        userEmail: email,
        subject:   subject || "(no subject)",
        category,
        priority:  category === "urgent" ? "urgent" as TicketPriority : "medium" as TicketPriority,
        message:   body,
      });
    } else {
      addInquiry({
        type:    "inquiry",
        name,
        email,
        company: "",
        message: body,
        topic:   subject || "Message from dashboard",
      });
    }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSubject("");
      setBody("");
      onClose();
    }, 2200);
  }

  const inputCls = "w-full bg-white/4 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.22 } }}
            exit={{ opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.15 } }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]">
                <div>
                  <h2 className="text-base font-semibold text-white">Contact your developer</h2>
                  <p className="text-xs text-white/35 mt-0.5">Anthony usually replies within a few hours.</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6 pt-4">
                {(["message", "ticket"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      tab === t ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    {t === "message" ? "💬 Send a message" : "🎫 Open a ticket"}
                  </button>
                ))}
              </div>

              {/* Body */}
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 px-6"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-400/15 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {tab === "ticket" ? "Ticket submitted!" : "Message sent!"}
                    </p>
                    <p className="text-xs text-white/35 mt-1 text-center">
                      {tab === "ticket"
                        ? "Your support ticket has been created. You'll hear back soon."
                        : "Your message has been delivered to Anthony."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="px-6 pb-6 pt-4 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    {tab === "ticket" && (
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                        className={inputCls}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value} className="bg-[#0d0d1a]">{c.label}</option>
                        ))}
                      </select>
                    )}

                    <input
                      placeholder={tab === "ticket" ? "Subject" : "What's this about? (optional)"}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={inputCls}
                    />

                    <textarea
                      rows={4}
                      placeholder={
                        tab === "ticket"
                          ? "Describe the issue in detail…"
                          : "Your message to Anthony…"
                      }
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className={`${inputCls} resize-none`}
                    />

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={submit}
                      disabled={!name || !email || !body}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        name && email && body
                          ? "bg-[#FF6B61] hover:bg-[#ff5244] text-white"
                          : "bg-white/4 text-white/20 cursor-not-allowed"
                      }`}
                    >
                      {tab === "ticket" ? "Submit ticket →" : "Send message →"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
