"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type InquiryStatus = 'new' | 'read' | 'replied';

interface Inquiry {
  _id: string;
  type: 'inquiry' | 'demo';
  name: string;
  email: string;
  company: string;
  message?: string;
  date?: string;
  time?: string;
  topic?: string;
  duration?: number;
  status: InquiryStatus;
  createdAt: string;
}

const STATUS_COLOR: Record<InquiryStatus, string> = {
  new:     'bg-[#FF6B61]/15 text-[#FF6B61]',
  read:    'bg-blue-400/15 text-blue-400',
  replied: 'bg-emerald-400/15 text-emerald-400',
};

const TYPE_COLOR = {
  inquiry: 'bg-violet-400/15 text-violet-400',
  demo:    'bg-orange-400/15 text-orange-400',
};

export default function InquiriesPage() {
  const [items,    setItems]    = useState<Inquiry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [typeF,    setTypeF]    = useState<'all' | 'inquiry' | 'demo'>('all');
  const [statusF,  setStatusF]  = useState<'all' | InquiryStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = items.filter((i) =>
    (typeF   === 'all' || i.type   === typeF) &&
    (statusF === 'all' || i.status === statusF)
  );

  const totalNew      = items.filter((i) => i.status === 'new').length;
  const totalInquiry  = items.filter((i) => i.type   === 'inquiry').length;
  const totalDemo     = items.filter((i) => i.type   === 'demo').length;

  async function mark(id: string, status: InquiryStatus) {
    await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, status } : i));
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Inquiries</h1>
        <p className="text-sm text-white/40 mt-1">Submissions from the public contact page</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',     value: items.length,   color: 'text-white' },
          { label: 'New',       value: totalNew,         color: 'text-[#FF6B61]' },
          { label: 'Inquiries', value: totalInquiry,     color: 'text-violet-400' },
          { label: 'Demos',     value: totalDemo,        color: 'text-orange-400' },
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
          {(['all', 'inquiry', 'demo'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeF(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                typeF === t ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t === 'all' ? 'All types' : t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          {(['all', 'new', 'read', 'replied'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusF(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                statusF === s ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {s === 'all' ? 'All statuses' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-white/30 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <div className="text-3xl mb-3">✉</div>
          <p className="text-white/40 text-sm">No inquiries yet.</p>
          <p className="text-white/20 text-xs mt-1">
            Share <span className="text-white/40">/contact</span> to start receiving submissions.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          {filtered.map((item, idx) => {
            const itemId = item._id;
            const isExpanded = expanded === itemId;
            return (
              <div key={itemId} className={idx < filtered.length - 1 ? 'border-b border-white/[0.06]' : ''}>
                {/* Row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : itemId)}
                  className="w-full text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Type */}
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLOR[item.type]}`}>
                      {item.type}
                    </span>
                    {/* Name + company */}
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-white">{item.name}</span>
                      {item.company && (
                        <span className="text-sm text-white/40 ml-2">· {item.company}</span>
                      )}
                    </div>
                    {/* Preview */}
                    <p className="hidden md:block flex-1 text-xs text-white/30 truncate max-w-[240px]">
                      {item.type === 'inquiry'
                        ? item.message?.slice(0, 80)
                        : `${item.date} @ ${item.time}`}
                    </p>
                    {/* Status */}
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[item.status]}`}>
                      {item.status}
                    </span>
                    {/* Date */}
                    <span className="shrink-0 text-xs text-white/25">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {/* Chevron */}
                    <svg
                      className={`shrink-0 w-3.5 h-3.5 text-white/25 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
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
                          {item.type === 'inquiry' && item.message && (
                            <div className="sm:col-span-2">
                              <p className="text-[11px] text-white/30 mb-1">Message</p>
                              <p className="text-sm text-white/80 leading-6">{item.message}</p>
                            </div>
                          )}
                          {item.type === 'demo' && (
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

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          {item.status === 'new' && (
                            <button
                              onClick={() => mark(itemId, 'read')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-colors font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                          {item.status !== 'replied' && (
                            <button
                              onClick={() => mark(itemId, 'replied')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors font-medium"
                            >
                              Mark as replied
                            </button>
                          )}
                          {item.status !== 'new' && (
                            <button
                              onClick={() => mark(itemId, 'new')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white/60 transition-colors font-medium"
                            >
                              Reopen
                            </button>
                          )}
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
    </div>
  );
}
