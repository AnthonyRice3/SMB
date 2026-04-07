"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: d } },
});

interface ClientData {
  clientId: string;
  name: string;
  email: string;
  plan: string;
  apiKey?: string;
}

export default function SettingsPage() {
  const [client, setClient]       = useState<ClientData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [revealed, setRevealed]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [rotating, setRotating]   = useState(false);
  const [newKey, setNewKey]       = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/clients/me")
      .then((r) => r.json())
      .then(setClient)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const apiKey = newKey ?? client?.apiKey;

  async function copyKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function rotateKey() {
    if (!confirm("Rotating your API key will immediately invalidate the current key. Continue?")) return;
    setRotating(true);
    const res = await fetch("/api/clients/me/rotate-key", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setNewKey(data.apiKey);
      setRevealed(true);
    }
    setRotating(false);
  }

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 10)}${"•".repeat(24)}${apiKey.slice(-4)}`
    : null;

  return (
    <div className="px-8 py-8 max-w-3xl">
      <motion.div variants={fade(0)} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-0.5">Manage your account and integration credentials</p>
      </motion.div>

      {/* Account info */}
      <motion.div variants={fade(0.04)} initial="hidden" animate="visible" className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-white mb-4">Account</h2>
        {loading ? (
          <p className="text-sm text-white/30">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Business name", value: client?.name },
              { label: "Email",         value: client?.email },
              { label: "Plan",          value: client?.plan ?? "Free" },
              { label: "Client ID",     value: client?.clientId },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
                <p className="text-sm text-white font-medium">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* API Key */}
      <motion.div variants={fade(0.08)} initial="hidden" animate="visible" className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-sm font-semibold text-white">API Key</h2>
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 font-medium">Secret</span>
        </div>
        <p className="text-xs text-white/40 mb-5">
          Use this key to authenticate calls from your web app to SAGAH&apos;s API.
          Send it as the <code className="text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px]">Authorization: Bearer &lt;key&gt;</code> header.
          Keep it private — do not expose it in browser code.
        </p>

        {loading ? (
          <div className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : apiKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/30 border border-white/[0.08] rounded-xl px-4 py-2.5 font-mono text-sm text-white/70 select-all overflow-hidden overflow-ellipsis whitespace-nowrap">
                {revealed ? apiKey : maskedKey}
              </div>
              <button
                onClick={() => setRevealed((v) => !v)}
                className="px-3 py-2.5 rounded-xl text-xs text-white/40 hover:text-white bg-white/[0.04] border border-white/[0.07] transition-colors shrink-0"
              >
                {revealed ? "Hide" : "Reveal"}
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={copyKey}
                className="px-3 py-2.5 rounded-xl text-xs font-medium transition-colors shrink-0 bg-white/[0.06] border border-white/[0.1] text-white hover:bg-white/[0.1]"
              >
                {copied ? "✓ Copied" : "Copy"}
              </motion.button>
            </div>
            <button
              onClick={rotateKey}
              disabled={rotating}
              className="text-xs text-white/25 hover:text-[#FF6B61] transition-colors"
            >
              {rotating ? "Rotating…" : "Rotate key →"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-white/30">No API key found. Contact support.</p>
        )}
      </motion.div>

      {/* Integration guide */}
      <motion.div variants={fade(0.12)} initial="hidden" animate="visible" className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Quick Integration</h2>
        <p className="text-xs text-white/40 mb-4">
          Add the following snippet to your web app to register users, track events, and more.
          Store your API key in an environment variable — never hardcode it.
        </p>

        {/* Install snippet */}
        <div className="mb-4">
          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">1. Install (optional helper)</p>
          <pre className="bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white/70 overflow-x-auto"><code>npm install sagah-sdk  # coming soon — or call the API directly</code></pre>
        </div>

        {/* Register user snippet */}
        <div className="mb-4">
          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">2. Register / identify a user</p>
          <pre className="bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white/70 overflow-x-auto"><code>{`// Call this after your user signs up or signs in
await fetch("https://sagah.xyz/api/v1/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + process.env.SAGAH_API_KEY,
  },
  body: JSON.stringify({
    email: user.email,
    name: user.name,
    plan: user.tier,          // optional
    metadata: { role: "admin" }, // optional
  }),
});`}</code></pre>
        </div>

        {/* Booking snippet */}
        <div className="mb-4">
          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">3. Create a booking</p>
          <pre className="bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white/70 overflow-x-auto"><code>{`await fetch("https://sagah.xyz/api/v1/bookings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + process.env.SAGAH_API_KEY,
  },
  body: JSON.stringify({
    name: "Jane Smith",
    email: "jane@example.com",
    service: "Consultation",
    date: "2026-05-01",      // YYYY-MM-DD
    time: "2:00 PM",
    duration: 60,            // minutes
  }),
});`}</code></pre>
        </div>

        {/* Email snippet */}
        <div className="mb-4">
          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">4. Send a transactional email</p>
          <pre className="bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white/70 overflow-x-auto"><code>{`await fetch("https://sagah.xyz/api/v1/email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + process.env.SAGAH_API_KEY,
  },
  body: JSON.stringify({
    to: "jane@example.com",
    subject: "Booking confirmed!",
    html: "<p>Your booking is confirmed for May 1 at 2:00 PM.</p>",
  }),
});`}</code></pre>
        </div>

        {/* Payments snippet */}
        <div>
          <p className="text-[10px] text-white/30 mb-1.5 uppercase tracking-wider">5. Accept a payment (requires Stripe Connect)</p>
          <pre className="bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white/70 overflow-x-auto"><code>{`// Server-side — get the clientSecret
const res = await fetch("https://sagah.xyz/api/v1/payments/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + process.env.SAGAH_API_KEY,
  },
  body: JSON.stringify({ amount: 5000, currency: "usd" }), // $50.00
});
const { clientSecret } = await res.json();

// Client-side — complete with Stripe.js
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
await stripe.confirmCardPayment(clientSecret, { ... });`}</code></pre>
        </div>
      </motion.div>
    </div>
  );
}
