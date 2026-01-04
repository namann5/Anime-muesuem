import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("loading");
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.split("?")[1] || "");
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/verify-session/${sessionId}`
        );
        const data = await response.json();

        if (data.status === "paid" || data.status === "complete") {
          setStatus("success");
          setSessionData(data);
        } else {
          setStatus("pending");
          setSessionData(data);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 mesh-gradient-modern">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-green-600/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-violet-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="animate-spin h-10 w-10 text-violet-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Verifying Payment...</h1>
            <p className="text-white/50">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-pulse">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Welcome to Premium!
            </h1>
            <p className="text-lg text-white/60 mb-8">
              Your subscription is now active. Enjoy ad-free streaming and
              exclusive content!
            </p>

            {sessionData && (
              <div className="glass-card-modern p-6 rounded-2xl mb-8 text-left">
                <h3 className="font-bold text-sm text-white/40 uppercase tracking-wider mb-4">
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  {sessionData.customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Email</span>
                      <span>{sessionData.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/50">Amount</span>
                    <span className="font-bold text-green-400">
                      ${(sessionData.amountTotal / 100).toFixed(2)}{" "}
                      {sessionData.currency?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Type</span>
                    <span className="capitalize">{sessionData.mode}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => (window.location.hash = "")}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl font-bold transition-all"
            >
              Start Watching →
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-amber-400">
              Payment Processing
            </h1>
            <p className="text-lg text-white/60 mb-8">
              Your payment is being processed. This may take a few moments.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 glass-card-modern rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Refresh Status
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-red-400">
              Verification Failed
            </h1>
            <p className="text-lg text-white/60 mb-8">
              We couldn't verify your payment. Please contact support if you
              were charged.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => (window.location.hash = "premium")}
                className="px-8 py-4 glass-card-modern rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.hash = "")}
                className="px-8 py-4 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Go Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
