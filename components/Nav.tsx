"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#learn', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const { isSignedIn, isLoaded, user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() { setMenuOpen(false); }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070e]/80 backdrop-blur-xl">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <Image src="/logo.png" alt="SAGAH" width={24} height={24} className="w-6 h-6 object-contain" />
          <span className="font-semibold text-white tracking-tight">SAGAH</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-white transition-colors duration-150">{label}</Link>
          ))}
          {isSignedIn && (
            <Link href="/dashboard" className="hover:text-white transition-colors duration-150">Dashboard</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-[#FF6B61]/70 hover:text-[#FF6B61] transition-colors duration-150">Admin</Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : isSignedIn ? (
              <UserButton
                appearance={{
                  variables: { colorPrimary: "#E81A54" },
                  elements: {
                    avatarBox: "!bg-[#E81A54]",
                    avatarImage: "!bg-[#E81A54]",
                    userButtonAvatarBox: "!bg-[#E81A54] [&>span]:text-[#360A0A] [&>span]:font-bold",
                  },
                }}
              />
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-white/60 hover:text-white transition-colors duration-150 px-3 py-1.5">
                  Log in
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/sign-up" className="bg-white text-[#07070e] py-1.5 px-4 rounded-full text-sm font-semibold">
                    Get started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile: user button (if signed in) + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {isSignedIn && (
              <UserButton
                appearance={{
                  variables: { colorPrimary: "#E81A54" },
                  elements: {
                    avatarBox: "!bg-[#E81A54]",
                    avatarImage: "!bg-[#E81A54]",
                    userButtonAvatarBox: "!bg-[#E81A54] [&>span]:text-[#360A0A] [&>span]:font-bold",
                  },
                }}
              />
            )}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-4 h-px bg-white/70 rounded-full origin-center"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.15 }}
                className="block w-4 h-px bg-white/70 rounded-full"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-4 h-px bg-white/70 rounded-full origin-center"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden md:hidden border-t border-white/[0.06] bg-[#07070e]"
          >
            <div className="px-6 py-5 space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`block px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    pathname === href ? 'text-white bg-white/[0.06]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {isSignedIn && (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className={`block px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    pathname?.startsWith('/dashboard') ? 'text-white bg-white/[0.06]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className={`block px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    pathname?.startsWith('/admin') ? 'text-[#FF6B61] bg-[#FF6B61]/[0.08]' : 'text-[#FF6B61]/60 hover:text-[#FF6B61] hover:bg-[#FF6B61]/[0.06]'
                  }`}
                >
                  Admin
                </Link>
              )}

              {/* Auth actions */}
              {!isSignedIn && (
                <div className="pt-3 mt-3 border-t border-white/[0.06] flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className="block text-center px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={closeMenu}
                    className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#07070e] hover:bg-white/90 transition-colors"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

