"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: d } },
});

interface DomainEntry {
  domain: string;
  status: "pending" | "approved" | "declined" | "active";
  requestedAt: string;
  resolvedAt?: string;
}

const STATUS_CONFIG: Record<DomainEntry["status"], { label: string; cls: string }> = {
  pending:  { label: "Pending review",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  approved: { label: "Approved",        cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  declined: { label: "Declined",        cls: "text-[#FF6B61] bg-[#FF6B61]/10 border-[#FF6B61]/20" },
  active:   { label: "In use",          cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
};

export default function DomainsPage() {
  const [domains, setDomains]     = useState<DomainEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [input, setInput]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    fetch("/api/domains")
      .then((r) => r.json())
      .then((d) => setDomains(d.domains ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const val = input.trim();
    if (!val) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: val }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setDomains((prev) => [data.domain, ...prev]);
        setInput("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const activeDomains  = domains.filter((d) => d.status === "active");
  const otherDomains   = domains.filter((d) => d.status !== "active");

  return (
    <div className="px-8 py-8 max-w-3xl space-y-8">
      <motion.div variants={fade(0)} initial="hidden" animate="visible">
        <h1 className="text-xl font-semibold text-white mb-1">Domains</h1>
        <p className="text-sm text-white/40">Submit domain names for your platform. Our team will review and connect them.</p>
      </motion.div>

      {/* Active domains */}
      {activeDomains.length > 0 && (
        <motion.div variants={fade(0.04)} initial="hidden" animate="visible" className="space-y-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Connected domains</h2>
          {activeDomains.map((d) => (
            <div key={d.domain} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{d.domain}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    Connected {d.resolvedAt ? new Date(d.resolvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_CONFIG.active.cls}`}>
                In use
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Submit form */}
      <motion.div variants={fade(0.08)} initial="hidden" animate="visible" className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Request a domain</h2>
        <p className="text-xs text-white/35 mb-4">Enter the domain you'd like to use, e.g. <span className="text-white/50 font-mono">app.yourcompany.com</span></p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="yourdomain.com"
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors font-mono"
            disabled={submitting}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting || !input.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#FF6B61] hover:bg-[#ff5244] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </motion.button>
        </form>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-[#FF6B61] mt-3">
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-emerald-400 mt-3">
              Domain request submitted. We'll review it shortly.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pending / resolved requests */}
      {(loading || otherDomains.length > 0) && (
        <motion.div variants={fade(0.12)} initial="hidden" animate="visible" className="space-y-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Requests</h2>

          {loading ? (
            <p className="text-sm text-white/25 py-4">Loading…</p>
          ) : otherDomains.length === 0 ? null : (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
              {otherDomains.map((d, i) => {
                const cfg = STATUS_CONFIG[d.status];
                return (
                  <div
                    key={d.domain}
                    className={`flex items-center justify-between px-5 py-4 ${i < otherDomains.length - 1 ? "border-b border-white/[0.05]" : ""}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-white font-mono">{d.domain}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">
                        Submitted {new Date(d.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {d.resolvedAt && (
                          <> · Reviewed {new Date(d.resolvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                        )}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {!loading && domains.length === 0 && (
        <motion.div variants={fade(0.12)} initial="hidden" animate="visible"
          className="text-center py-12 text-white/25 text-sm">
          No domain requests yet. Submit your first one above.
        </motion.div>
      )}
    </div>
  );
}
