"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/pipeline",
    label: "My Pipeline",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    href: "/dashboard/data",
    label: "My Data",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    href: "/dashboard/calendar",
    label: "Calendar",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [client, setClient] = useState<{ name: string; plan: string } | null>(null);

  useEffect(() => {
    fetch("/api/clients/me")
      .then((r) => r.json())
      .then((d) => { if (d?.name) setClient({ name: d.name, plan: d.plan ?? "Free" }); })
      .catch(() => null);
  }, []);

  const initials = client?.name
    ? client.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "–";

  return (
    <aside className="w-56 shrink-0 border-r border-white/[0.06] bg-[#0a0a14] flex flex-col">
      {/* Logo + user */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-md bg-[#FF6B61] shrink-0" />
          <span className="font-semibold text-white text-sm tracking-tight">SAGAH</span>
        </Link>
        {/* User identity */}
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6B61] to-[#ff9a8b] flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{client?.name ?? "Loading…"}</p>
            <p className="text-[10px] text-white/30 truncate">{client?.plan ?? "—"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => {
          const active =
            href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="dash-pill"
                  className="absolute inset-0 bg-white/[0.07] rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 shrink-0">{icon}</span>
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/[0.06] space-y-2">
        <Link
          href="/contact"
          className="flex items-center gap-2 text-xs text-[#FF6B61] hover:text-[#ff9a8b] transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Message your developer
        </Link>
        <Link href="/" className="text-xs text-white/25 hover:text-white/50 transition-colors block">
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
