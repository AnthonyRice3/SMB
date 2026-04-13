"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, UserButton } from '@clerk/nextjs';
import AuthModal from './AuthModal';

type ModalMode = "sign-in" | "sign-up" | null;

export default function Nav() {
  const { isSignedIn, isLoaded, user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [modal, setModal] = useState<ModalMode>(null);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070e]/80 backdrop-blur-xl">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="SAGAH" width={24} height={24} className="w-6 h-6 object-contain" />
          <span className="font-semibold text-white tracking-tight">SAGAH</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors duration-150">Home</Link>
          <Link href="/#learn" className="hover:text-white transition-colors duration-150">Features</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors duration-150">How it works</Link>
          <Link href="/about" className="hover:text-white transition-colors duration-150">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors duration-150">Contact</Link>
          {isSignedIn && (
            <Link href="/dashboard" className="hover:text-white transition-colors duration-150">
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-[#FF6B61]/70 hover:text-[#FF6B61] transition-colors duration-150">
              Admin
            </Link>
          )}
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : isSignedIn ? (
            <UserButton
              appearance={{
                variables: {
                  colorPrimary: "#E81A54",
                },
                elements: {
                  avatarBox: "!bg-[#E81A54]",
                  avatarImage: "!bg-[#E81A54]",
                  userButtonAvatarBox: "!bg-[#E81A54] [&>span]:text-[#360A0A] [&>span]:font-bold",
                },
              }}
            />
          ) : (
            <>
              <button
                onClick={() => setModal("sign-in")}
                className="text-sm text-white/60 hover:text-white transition-colors duration-150 px-3 py-1.5 cursor-pointer"
              >
                Log in
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModal("sign-up")}
                className="bg-white text-[#07070e] py-1.5 px-4 rounded-full text-sm font-semibold cursor-pointer"
              >
                Get started
              </motion.button>
            </>
          )}
        </div>
      </nav>
    </header>

    <AnimatePresence>
      {modal && (
        <AuthModal
          initialMode={modal}
          onClose={() => setModal(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
