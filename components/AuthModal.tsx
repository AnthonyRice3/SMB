"use client";

import { useEffect, useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Mode = "sign-in" | "sign-up";
type SiStep = "credentials" | "verify";
type SuStep = "register" | "verify";

interface AuthModalProps {
  initialMode?: Mode;
  onClose: () => void;
}

export default function AuthModal({ initialMode = "sign-in", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const { signIn, fetchStatus: siFetch } = useSignIn();
  const { signUp, fetchStatus: suFetch } = useSignUp();

  // ── sign-in state ─────────────────────────────────────────────────────────
  const [siStep, setSiStep] = useState<SiStep>("credentials");
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siCode, setSiCode] = useState("");
  const [siError, setSiError] = useState("");
  const siLoading = siFetch === "fetching";

  // ── sign-up state ─────────────────────────────────────────────────────────
  const [suStep, setSuStep]             = useState<SuStep>("register");
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [businessName, setBusinessName] = useState("");
  const [suEmail, setSuEmail]           = useState("");
  const [suPassword, setSuPassword]     = useState("");
  const [suCode, setSuCode]             = useState("");
  const [suError, setSuError]           = useState("");
  const suLoading = suFetch === "fetching";

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const getErr = (e: unknown) => {
    const x = e as { longMessage?: string; message?: string } | null;
    return x?.longMessage ?? x?.message ?? "Something went wrong.";
  };

  // ── sign-in handlers ──────────────────────────────────────────────────────
  const handleSiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setSiError("");
    const { error } = await signIn.password({ emailAddress: siEmail, password: siPassword });
    if (error) { setSiError(getErr(error)); return; }
    if (signIn.status === "complete") await finalizeSi();
    else if (signIn.status === "needs_client_trust") {
      await signIn.mfa.sendEmailCode();
      setSiStep("verify");
    }
  };

  const handleSiVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setSiError("");
    const { error } = await signIn.mfa.verifyEmailCode({ code: siCode });
    if (error) { setSiError(getErr(error)); return; }
    if (signIn.status === "complete") await finalizeSi();
  };

  const finalizeSi = async () => {
    await signIn!.finalize({
      navigate: ({ decorateUrl }) => {
        onClose();
        window.location.href = decorateUrl(`${window.location.origin}/dashboard`);
      },
    });
  };

  const handleSiGoogle = async () => {
    if (!signIn) return;
    setSiError("");
    const { error } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
    });
    if (error) setSiError(getErr(error));
  };

  // ── sign-up handlers ──────────────────────────────────────────────────────
  const handleSuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setSuError("");
    const { error } = await signUp.password({
      emailAddress: suEmail,
      password: suPassword,
      firstName,
      lastName,
      unsafeMetadata: { businessName },
    });
    if (error) { setSuError(getErr(error)); return; }
    await signUp.verifications.sendEmailCode();
    setSuStep("verify");
  };

  const handleSuVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setSuError("");
    const { error } = await signUp.verifications.verifyEmailCode({ code: suCode });
    if (error) { setSuError(getErr(error)); return; }
    await finalizeSu();
  };

  const finalizeSu = async () => {
    await signUp!.finalize({
      navigate: ({ decorateUrl }) => {
        onClose();
        window.location.href = decorateUrl(`${window.location.origin}/dashboard`);
      },
    });
  };

  const handleSuGoogle = async () => {
    if (!signUp) return;
    setSuError("");
    const { error } = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
    });
    if (error) setSuError(getErr(error));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setSiError(""); setSiStep("credentials"); setSiCode("");
    setSuError(""); setSuStep("register"); setSuCode(""); setBusinessName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-[#07070e]/85 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex justify-center items-center overflow-hidden">
        <div className="h-[500px] w-[700px] rounded-full bg-[#FF6B61]/[0.07] blur-[140px]" />
      </div>

      {/* Modal card */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo + close row */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image src="/logo.png" alt="SAGAH" width={28} height={28} className="w-7 h-7 object-contain" />
            <span className="font-bold text-white tracking-tight">SAGAH</span>
          </Link>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors p-1 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.65)]">
          {/* Tab bar */}
          <div className="flex border-b border-white/[0.07]">
            {(["sign-in", "sign-up"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`relative flex-1 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                  mode === m ? "text-white" : "text-white/35 hover:text-white/60"
                }`}
              >
                {m === "sign-in" ? "Sign in" : "Create account"}
                {mode === m && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-[#FF6B61]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {mode === "sign-in" ? (
                <motion.div
                  key="sign-in"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18 }}
                >
                  <AnimatePresence mode="wait">
                    {siStep === "credentials" ? (
                      <motion.div key="si-creds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <GoogBtn onClick={handleSiGoogle} loading={siLoading} />
                        <Divider />
                        {siError && <ErrBanner msg={siError} />}
                        <form onSubmit={handleSiSubmit} className="space-y-3.5">
                          <Field label="Email" type="email" value={siEmail} onChange={setSiEmail} placeholder="you@company.com" autoComplete="email" />
                          <Field label="Password" type="password" value={siPassword} onChange={setSiPassword} placeholder="••••••••" autoComplete="current-password" />
                          <PrimaryBtn loading={siLoading} label="Sign in" loadingLabel="Signing in…" />
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div key="si-verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="text-center mb-5">
                          <div className="flex justify-center mb-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#FF6B61]/10 border border-[#FF6B61]/20 flex items-center justify-center">
                              <EmailIcon />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-white/70">Verify your device</p>
                          <p className="text-xs text-white/35 mt-1">
                            Code sent to <span className="text-white/55">{siEmail}</span>
                          </p>
                        </div>
                        {siError && <ErrBanner msg={siError} />}
                        <form onSubmit={handleSiVerify} className="space-y-3.5">
                          <CodeInput value={siCode} onChange={setSiCode} />
                          <PrimaryBtn loading={siLoading} disabled={siCode.length < 6} label="Verify" loadingLabel="Verifying…" />
                        </form>
                        <div className="flex justify-center gap-4 mt-4">
                          <button type="button" onClick={() => signIn?.mfa.sendEmailCode()} className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                            Resend code
                          </button>
                          <span className="text-white/15">·</span>
                          <button type="button" onClick={() => { setSiStep("credentials"); setSiError(""); setSiCode(""); }} className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                            Go back
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="sign-up"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <AnimatePresence mode="wait">
                    {suStep === "register" ? (
                      <motion.div key="su-reg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <GoogBtn onClick={handleSuGoogle} loading={suLoading} />
                        <Divider />
                        {suError && <ErrBanner msg={suError} />}
                        <form onSubmit={handleSuSubmit} className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="First name" type="text" value={firstName} onChange={setFirstName} placeholder="Alex" autoComplete="given-name" />
                            <Field label="Last name" type="text" value={lastName} onChange={setLastName} placeholder="Smith" autoComplete="family-name" />
                          </div>
                          <Field label="Business name" type="text" value={businessName} onChange={setBusinessName} placeholder="Acme Corp" autoComplete="organization" />
                          <Field label="Work email" type="email" value={suEmail} onChange={setSuEmail} placeholder="you@company.com" autoComplete="email" />
                          <Field label="Password" type="password" value={suPassword} onChange={setSuPassword} placeholder="Min. 8 characters" autoComplete="new-password" minLength={8} />
                          <div id="clerk-captcha" />
                          <PrimaryBtn loading={suLoading} label="Create account" loadingLabel="Creating…" />
                        </form>
                        <p className="text-xs text-white/25 text-center mt-3">
                          By signing up you agree to our{" "}
                          <Link href="/terms" onClick={onClose} className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">
                            Terms
                          </Link>
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div key="su-verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <div className="text-center mb-5">
                          <div className="flex justify-center mb-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#FF6B61]/10 border border-[#FF6B61]/20 flex items-center justify-center">
                              <EmailIcon />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-white/70">Check your email</p>
                          <p className="text-xs text-white/35 mt-1">
                            Code sent to <span className="text-white/55">{suEmail}</span>
                          </p>
                        </div>
                        {suError && <ErrBanner msg={suError} />}
                        <form onSubmit={handleSuVerify} className="space-y-3.5">
                          <CodeInput value={suCode} onChange={setSuCode} />
                          <PrimaryBtn loading={suLoading} disabled={suCode.length < 6} label="Verify email" loadingLabel="Verifying…" />
                        </form>
                        <div className="flex justify-center gap-4 mt-4">
                          <button type="button" onClick={() => signUp?.verifications.sendEmailCode()} className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                            Resend code
                          </button>
                          <span className="text-white/15">·</span>
                          <button type="button" onClick={() => { setSuStep("register"); setSuError(""); setSuCode(""); }} className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                            Change email
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Field({
  label, type, value, onChange, placeholder, autoComplete, minLength,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  autoComplete?: string; minLength?: number;
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
        minLength={minLength}
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

function PrimaryBtn({ loading, disabled, label, loadingLabel }: {
  loading: boolean; disabled?: boolean; label: string; loadingLabel: string;
}) {
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

function ErrBanner({ msg }: { msg: string }) {
  return (
    <div className="mb-3.5 px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
      {msg}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-white/[0.07]" />
      <span className="text-xs text-white/25">or</span>
      <div className="flex-1 h-px bg-white/[0.07]" />
    </div>
  );
}

function GoogBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors duration-150 disabled:opacity-50 cursor-pointer"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B61" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
