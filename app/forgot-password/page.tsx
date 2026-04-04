"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Step = "email" | "code" | "done";

const slide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
};

export default function ForgotPasswordPage() {
  const { signIn, fetchStatus } = useSignIn();

  const [step, setStep]             = useState<Step>("email");
  const [email, setEmail]           = useState("");
  const [code, setCode]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError]           = useState("");

  const loading = fetchStatus === "fetching";

  const getErr = (err: unknown) => {
    const e = err as { longMessage?: string; message?: string } | null;
    return e?.longMessage ?? e?.message ?? "Something went wrong.";
  };

  /* Step 1: create sign-in with identifier, then send reset code */
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setError("");

    const { error: createErr } = await signIn.create({ identifier: email });
    if (createErr) { setError(getErr(createErr)); return; }

    const { error: sendErr } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendErr) { setError(getErr(sendErr)); return; }

    setStep("code");
  };

  /* Step 2: verify code, then submit new password */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setError("");

    const { error: verifyErr } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyErr) { setError(getErr(verifyErr)); return; }

    const { error: submitErr } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (submitErr) { setError(getErr(submitErr)); return; }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          window.location.href = decorateUrl(`${window.location.origin}/dashboard`);
        },
      });
    } else {
      setStep("done");
    }
  };

  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 flex justify-center overflow-hidden">
        <div className="-mt-24 h-[600px] w-[800px] rounded-full bg-[#FF6B61]/[0.06] blur-[160px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-[#FF6B61] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4.5V9L6 11L1 8.5V4L6 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">SAGAH</span>
        </Link>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Enter email ─────────────────────────────── */}
            {step === "email" && (
              <motion.div key="email" {...slide} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-white tracking-tight">Reset password</h1>
                  <p className="text-sm text-white/40 mt-1">We&apos;ll send a code to your email</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF6B61] hover:bg-[#ff5a4e] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Sending…" : "Send reset code"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: Enter code + new password ──────────────── */}
            {step === "code" && (
              <motion.div key="code" {...slide} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-white tracking-tight">Check your email</h1>
                  <p className="text-sm text-white/40 mt-1">
                    Enter the code sent to <span className="text-white/60">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Verification code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      autoComplete="one-time-code"
                      placeholder="123456"
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors tracking-[0.3em] text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF6B61] hover:bg-[#ff5a4e] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Resetting…" : "Reset password"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step 3: Done ───────────────────────────────────── */}
            {step === "done" && (
              <motion.div key="done" {...slide} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M6 10l3 3 5-6" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-tight mb-1">Password reset</h1>
                  <p className="text-sm text-white/40 mb-6">You can now sign in with your new password.</p>
                  <Link
                    href="/sign-in"
                    className="inline-block w-full bg-[#FF6B61] hover:bg-[#ff5a4e] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] text-center"
                  >
                    Sign in
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link href="/sign-in" className="text-xs text-white/30 hover:text-white/50 transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
