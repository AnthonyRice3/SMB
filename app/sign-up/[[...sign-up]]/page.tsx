"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Step = "register" | "verify";

const slide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
};

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();

  const [step, setStep]           = useState<Step>("register");
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [businessName, setBusinessName] = useState("");
  const [code, setCode]           = useState("");
  const [error, setError]         = useState("");

  const loading = fetchStatus === "fetching";

  const getErrorMsg = (err: unknown) => {
    const e = err as { longMessage?: string; message?: string } | null;
    return e?.longMessage ?? e?.message ?? "Something went wrong. Please try again.";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setError("");

    const { error: err } = await signUp.password({ emailAddress: email, password, firstName, lastName, unsafeMetadata: { businessName } });
    if (err) { setError(getErrorMsg(err)); return; }

    await signUp.verifications.sendEmailCode();
    setStep("verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setError("");

    const { error: err } = await signUp.verifications.verifyEmailCode({ code });
    if (err) { setError(getErrorMsg(err)); return; }

    if (signUp.status === "complete") await finalize();
  };

  const finalize = async () => {
    await signUp!.finalize({
      navigate: ({ decorateUrl }) => {
        window.location.href = decorateUrl(`${window.location.origin}/dashboard`);
      },
    });
  };

  const handleResend = async () => {
    if (!signUp) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleGoogle = async () => {
    if (!signUp) return;
    setError("");
    const { error: err } = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
    });
    if (err) setError(getErrorMsg(err));
  };

  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed inset-0 flex justify-center overflow-hidden">
        <div className="-mt-24 h-[600px] w-[800px] rounded-full bg-[#FF6B61]/[0.06] blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-[#FF6B61] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4.5V9L6 11L1 8.5V4L6 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">SAGAH</span>
        </Link>

        <AnimatePresence mode="wait">
          {step === "register" ? (
            <motion.div key="register" {...slide} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-white tracking-tight">Create your account</h1>
                  <p className="text-sm text-white/40 mt-1">Start building with SAGAH — it&apos;s free</p>
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors duration-150 mb-5 disabled:opacity-50 cursor-pointer"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/[0.07]" />
                  <span className="text-xs text-white/25">or continue with email</span>
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </div>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">First name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoComplete="given-name"
                        placeholder="Alex"
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Last name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        autoComplete="family-name"
                        placeholder="Smith"
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Work email</label>
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

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Business name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      autoComplete="organization"
                      placeholder="Acme Corp"
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                    />
                  </div>

                  <PrimaryButton loading={loading} label="Create account" loadingLabel="Creating account…" />

                  <p className="text-xs text-white/25 text-center">
                    By creating an account you agree to our{" "}
                    <Link href="/terms" className="text-white/40 hover:text-white/60 transition-colors underline underline-offset-2">
                      Terms of Service
                    </Link>
                  </p>
                </form>

                {/* Required by Clerk for bot protection */}
                <div id="clerk-captcha" className="mt-4" />
              </div>

              <p className="text-center text-sm text-white/30 mt-5">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-[#FF6B61] hover:text-[#ff8a82] transition-colors font-medium">
                  Sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div key="verify" {...slide} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                <div className="flex justify-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF6B61]/10 border border-[#FF6B61]/20 flex items-center justify-center">
                    <EmailIcon />
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-white tracking-tight">Check your email</h1>
                  <p className="text-sm text-white/40 mt-1.5">
                    We sent a 6-digit code to{" "}
                    <span className="text-white/60 font-medium">{email}</span>
                  </p>
                </div>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleVerify} className="space-y-4">
                  <CodeInput value={code} onChange={setCode} />
                  <PrimaryButton loading={loading} disabled={code.length < 6} label="Verify email" loadingLabel="Verifying…" />
                </form>

                <div className="flex items-center justify-center gap-4 mt-5">
                  <button type="button" onClick={handleResend} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                    Resend code
                  </button>
                  <span className="text-white/15">·</span>
                  <button type="button" onClick={() => { setStep("register"); setError(""); setCode(""); }} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                    Change email
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5 text-center">Verification code</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        required
        autoComplete="one-time-code"
        placeholder="000000"
        maxLength={6}
        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-2xl font-mono tracking-[0.5em] text-center rounded-xl px-3.5 py-3 outline-none transition-colors"
      />
    </div>
  );
}

function PrimaryButton({ loading, disabled, label, loadingLabel }: { loading: boolean; disabled?: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-[#FF6B61] hover:bg-[#ff5244] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
      {message}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B61" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
