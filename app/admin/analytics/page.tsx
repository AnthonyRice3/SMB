"use client";
"use client";

export default function AnalyticsPage() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Platform Analytics</h1>
        <p className="text-sm text-white/40 mt-0.5">Aggregated usage across all clients</p>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-8 py-16 text-center">
        <p className="text-white/50 text-sm font-medium mb-2">Analytics not yet available</p>
        <p className="text-white/25 text-xs max-w-sm mx-auto">
          Platform-level analytics will be aggregated automatically once clients start using their apps.
        </p>
      </div>
    </div>
  );
}
