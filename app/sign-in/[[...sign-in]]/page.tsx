"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Step = "credentials" | "verify";

const slide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
};

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [step, setStep]         = useState<Step>("credentials");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");

  const loading = fetchStatus === "fetching";

  const getErrorMsg = (err: unknown) => {
    const e = err as { longMessage?: string; message?: string } | null;
    return e?.longMessage ?? e?.message ?? "Something went wrong. Please try again.";
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setError("");

    const { error: err } = await signIn.password({ emailAddress: email, password });
    if (err) { setError(getErrorMsg(err)); return; }

    if (signIn.status === "complete") {
      await finalize();
    } else if (signIn.status === "needs_client_trust") {
      // Client Trust: Clerk sends a code to the email to verify the device
      await signIn.mfa.sendEmailCode();
      setStep("verify");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setError("");

    const { error: err } = await signIn.mfa.verifyEmailCode({ code });
    if (err) { setError(getErrorMsg(err)); return; }

    if (signIn.status === "complete") await finalize();
  };

  const finalize = async () => {
    await signIn!.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl("/dashboard");
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
  };

  const handleGoogle = async () => {
    if (!signIn) return;
    setError("");
    const { error: err } = await signIn.sso({
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

        <AnimatePresence mode="wait">
          {step === "credentials" ? (
            <motion.div key="credentials" {...slide} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-white tracking-tight">Welcome back</h1>
                  <p className="text-sm text-white/40 mt-1">Sign in to your SAGAH account</p>
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

                <Divider />

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handlePassword} className="space-y-4">
                  <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" autoComplete="email" />
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-white/50">Password</label>
                      <Link href="/forgot-password" className="text-xs text-[#FF6B61]/70 hover:text-[#FF6B61] transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                    />
                  </div>
                  <PrimaryButton loading={loading} label="Sign in" loadingLabel="Signing in…" />
                </form>
              </div>

              <p className="text-center text-sm text-white/30 mt-5">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-[#FF6B61] hover:text-[#ff8a82] transition-colors font-medium">
                  Create one free
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
                  <h1 className="text-xl font-bold text-white tracking-tight">Verify your device</h1>
                  <p className="text-sm text-white/40 mt-1.5">
                    We sent a code to <span className="text-white/60 font-medium">{email}</span>
                  </p>
                </div>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleVerify} className="space-y-4">
                  <CodeInput value={code} onChange={setCode} />
                  <PrimaryButton loading={loading} disabled={code.length < 6} label="Verify" loadingLabel="Verifying…" />
                </form>

                <div className="flex items-center justify-center gap-4 mt-5">
                  <button type="button" onClick={() => signIn?.mfa.sendEmailCode()} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                    Resend code
                  </button>
                  <span className="text-white/15">·</span>
                  <button type="button" onClick={() => { setStep("credentials"); setError(""); setCode(""); }} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                    Go back
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({ label, type, value, onChange, placeholder, autoComplete }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF6B61]/50 text-white placeholder-white/20 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
      />
    </div>
  );
}

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

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-white/[0.07]" />
      <span className="text-xs text-white/25">or continue with email</span>
      <div className="flex-1 h-px bg-white/[0.07]" />
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
