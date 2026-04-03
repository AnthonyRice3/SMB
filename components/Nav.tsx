"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070e]/80 backdrop-blur-xl">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#FF6B61] flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4.5V9L6 11L1 8.5V4L6 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight">SAGAH</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors duration-150">Home</Link>
          <Link href="/#learn" className="hover:text-white transition-colors duration-150">Features</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors duration-150">How it works</Link>
          <Link href="/about" className="hover:text-white transition-colors duration-150">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors duration-150">Contact</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors duration-150">Dashboard</Link>
        </div>

        {/* CTA */}
        <motion.a
          href="#get-started"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white text-[#07070e] py-1.5 px-4 rounded-full text-sm font-semibold"
        >
          Get started
        </motion.a>
      </nav>
    </header>
  );
}
