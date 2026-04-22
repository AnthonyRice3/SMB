"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getInquiries, INQUIRY_EVENT } from '../../lib/inquiries';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  showBadge?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/admin/actions',
    label: 'Actions',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: '/admin/monetization',
    label: 'Monetization',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/admin/consultations',
    label: 'Consultations',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/admin/inquiries',
    label: 'Inquiries',
    showBadge: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [newCount, setNewCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function refresh() {
      setNewCount(getInquiries().filter((i) => i.status === 'new').length);
    }
    refresh();
    window.addEventListener(INQUIRY_EVENT, refresh);
    return () => window.removeEventListener(INQUIRY_EVENT, refresh);
  }, []);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon, showBadge }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute inset-0 bg-white/[0.07] rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 shrink-0">{icon}</span>
              <span className="relative z-10 flex-1">{label}</span>
              {showBadge && newCount > 0 && (
                <span className="relative z-10 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-[#FF6B61] text-white rounded-full">
                  {newCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <Link href="/" onClick={onClose} className="text-xs text-white/25 hover:text-white/50 transition-colors">
          ← Back to site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-white/[0.06] bg-[#0a0a14] flex-col">
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SAGAH" width={20} height={20} className="w-5 h-5 object-contain" />
            <span className="font-semibold text-white text-sm tracking-tight">SAGAH</span>
          </Link>
          <p className="mt-1 text-[11px] text-white/25 pl-7">Admin Panel</p>
        </div>
        <NavLinks />
      </aside>

      {/* ── Mobile top bar ──────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 bg-[#0a0a14] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SAGAH" width={20} height={20} className="w-5 h-5 object-contain" />
            <span className="font-semibold text-white text-sm tracking-tight">SAGAH</span>
          </Link>
          <span className="text-[10px] text-white/25 ml-1">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-[#FF6B61] text-white rounded-full">
              {newCount}
            </span>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
            aria-label="Toggle menu"
          >
            <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} className="block w-4 h-px bg-white/70 rounded-full origin-center" />
            <motion.span animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.15 }} className="block w-4 h-px bg-white/70 rounded-full" />
            <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} className="block w-4 h-px bg-white/70 rounded-full origin-center" />
          </button>
        </div>
      </div>

      {/* ── Mobile spacer ───────────────────────────── */}
      <div className="md:hidden h-14 shrink-0" />

      {/* ── Mobile drawer overlay ───────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="admin-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              key="admin-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="md:hidden fixed top-14 left-0 bottom-0 z-50 w-72 bg-[#0a0a14] border-r border-white/[0.06] flex flex-col"
            >
              <NavLinks onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
