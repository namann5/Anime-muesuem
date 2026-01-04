import React from "react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 mesh-gradient-modern">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-amber-600/15 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-pink-600/15 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Payment Cancelled
        </h1>

        <p className="text-lg text-white/60 mb-8">
          No worries! Your payment was cancelled and you haven't been charged.
          Feel free to try again when you're ready.
        </p>

        <div className="glass-card-modern p-6 rounded-2xl mb-8">
          <h3 className="font-bold text-white/70 mb-3">Why go Premium?</h3>
          <ul className="text-left text-sm text-white/50 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> Ad-free streaming
              experience
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> HD & 4K video quality
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> Early access to new
              releases
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> Exclusive premium
              content
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => (window.location.hash = "premium")}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl font-bold transition-all"
          >
            Try Again →
          </button>
          <button
            onClick={() => (window.location.hash = "")}
            className="px-8 py-4 glass-card-modern rounded-xl font-bold hover:bg-white/10 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
