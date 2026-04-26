"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold text-stone-100 mb-4">
          Something broke.
        </h1>
        <p className="text-lg text-stone-400 mb-8">
          Redline hit an unexpected error. You can try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-[18px] px-6 py-3 bg-[#ff4b3e] text-white font-medium transition hover:-translate-y-0.5 shadow-[0_18px_42px_rgba(255,75,62,0.22)] mb-6"
        >
          Try again
        </button>
        <div>
          <a
            href="/dashboard"
            className="text-stone-400 hover:text-stone-300 transition underline"
          >
            Go to dashboard
          </a>
        </div>
        {process.env.NODE_ENV !== "production" && error.digest && (
          <div className="mt-6 text-xs text-stone-600 bg-stone-950/50 p-3 rounded font-mono break-all">
            {error.digest}
          </div>
        )}
      </div>
    </div>
  );
}
