"use client";
"use client";

export default function ActionsPage() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">User Actions</h1>
        <p className="text-sm text-white/40 mt-0.5">Platform activity log</p>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-8 py-16 text-center">
        <p className="text-white/50 text-sm font-medium mb-2">No events yet</p>
        <p className="text-white/25 text-xs max-w-sm mx-auto">
          Activity events will appear here once audit logging is connected to the platform.
        </p>
      </div>
    </div>
  );
}
