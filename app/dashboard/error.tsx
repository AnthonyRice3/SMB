"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#07070e] text-white p-8">
      <h2 className="text-2xl font-bold text-[#FF6B61] mb-4">Dashboard Error</h2>
      <pre className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300 max-w-2xl overflow-auto mb-6 whitespace-pre-wrap">
        {error.message}
        {error.digest ? `\n\nDigest: ${error.digest}` : ""}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#FF6B61] text-white rounded-lg hover:bg-[#FF6B61]/80"
      >
        Try again
      </button>
    </div>
  );
}
