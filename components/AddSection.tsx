"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AddSection() {
  return (
    <section className="py-16 px-6" id="get-started">
      <motion.div
        className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border border-[#FF6B61]/20 bg-gradient-to-br from-[#FF6B61]/10 via-[#ff9a8b]/5 to-transparent p-14 md:p-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[300px] w-[300px] rounded-full bg-[#FF6B61]/15 blur-[80px]" />
        </div>
        <div className="relative">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#FF6B61] mb-4">Get started</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to ship your SMB app?
          </h2>
          <p className="text-white/50 max-w-md mx-auto mb-8 leading-7">
            Join thousands of developers building with SMBConnect. Free to start — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a
              href="#get-started"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block bg-[#FF6B61] hover:bg-[#ff5244] text-white py-3 px-7 rounded-full font-semibold text-sm transition-colors"
            >
              Create free account
            </motion.a>
            <Link href="/contact">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block bg-white/[0.07] border border-white/10 hover:bg-white/[0.1] text-white py-3 px-7 rounded-full font-semibold text-sm transition-colors cursor-pointer"
              >
                Book a demo
              </motion.span>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
