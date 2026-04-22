"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type ActionItem = {
  id: string;
  at: string;
  scope: "platform" | "client-app";
  actorType: "client" | "user" | "system";
  actor: string;
  clientId: string | null;
  action: string;
  details: string;
};

type ActionsResponse = {
  total: number;
  byScope: { platform: number; clientApps: number };
  recent: ActionItem[];
};

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: d } },
});

export default function ActionsPage() {
  const [data, setData] = useState<ActionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "platform" | "client-app">("all");

  useEffect(() => {
    fetch("/api/admin/actions")
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const actions = data?.recent ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actions.filter((a) => {
      if (scope !== "all" && a.scope !== scope) return false;
      if (!q) return true;
      return (
        a.action.toLowerCase().includes(q) ||
        a.actor.toLowerCase().includes(q) ||
        (a.clientId ?? "").toLowerCase().includes(q) ||
        a.details.toLowerCase().includes(q)
      );
    });
  }, [actions, query, scope]);

  return (
    <div className="px-8 py-8">
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-6">
        <h1 className="text-xl font-semibold text-white">Actions</h1>
        <p className="text-sm text-white/40 mt-0.5">Global activity across platform and client apps</p>
      </motion.div>

      <motion.div variants={fade(0.05)} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/3 border border-white/7 rounded-2xl p-5">
          <p className="text-xs text-white/40 mb-1">Total Actions</p>
          <p className="text-2xl font-bold text-white">{loading ? "..." : (data?.total ?? 0).toLocaleString()}</p>
        </div>
        <div className="bg-white/3 border border-white/7 rounded-2xl p-5">
          <p className="text-xs text-white/40 mb-1">Platform</p>
          <p className="text-2xl font-bold text-[#FF6B61]">{loading ? "..." : (data?.byScope.platform ?? 0).toLocaleString()}</p>
        </div>
        <div className="bg-white/3 border border-white/7 rounded-2xl p-5">
          <p className="text-xs text-white/40 mb-1">Client Apps</p>
          <p className="text-2xl font-bold text-emerald-400">{loading ? "..." : (data?.byScope.clientApps ?? 0).toLocaleString()}</p>
        </div>
      </motion.div>

      <motion.div variants={fade(0.1)} initial="hidden" animate="visible" className="mb-4 flex gap-3 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions, actor, client..."
          className="w-80 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none"
        />
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          {([
            ["all", "All"],
            ["platform", "Platform"],
            ["client-app", "Client Apps"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setScope(key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${scope === key ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/70"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fade(0.14)} initial="hidden" animate="visible" className="bg-white/3 border border-white/7 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-sm text-white/30 text-center">Loading actions...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-sm text-white/30 text-center">No actions match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {[
                    "Time",
                    "Scope",
                    "Action",
                    "Actor",
                    "Client",
                    "Details",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 text-xs text-white/45">
                      {new Date(a.at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full border ${a.scope === "platform" ? "bg-[#FF6B61]/10 border-[#FF6B61]/25 text-[#FF6B61]" : "bg-emerald-400/10 border-emerald-400/25 text-emerald-400"}`}>
                        {a.scope}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/80">{a.action}</td>
                    <td className="px-5 py-3 text-xs text-white/70">{a.actor}</td>
                    <td className="px-5 py-3 text-xs font-mono text-white/60">{a.clientId ?? "-"}</td>
                    <td className="px-5 py-3 text-xs text-white/45 max-w-120 truncate">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
