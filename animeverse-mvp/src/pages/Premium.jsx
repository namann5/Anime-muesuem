import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Premium() {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plans = {
    monthly: {
      name: "Monthly",
      price: "$9.99",
      priceValue: 999,
      period: "/month",
      features: [
        "Ad-free streaming",
        "HD & 4K quality",
        "Download episodes",
        "Early access to releases",
        "Exclusive content",
      ],
      popular: false,
    },
    yearly: {
      name: "Yearly",
      price: "$79.99",
      priceValue: 7999,
      period: "/year",
      savings: "Save $40",
      features: [
        "All Monthly features",
        "HD & 4K quality",
        "Priority support",
        "Beta feature access",
        "Special events access",
        "2 months FREE",
      ],
      popular: true,
    },
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          email: email || undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-32 pb-20 px-4 md:px-6 mesh-gradient-modern">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-1.5 glass-card-modern rounded-full text-xs font-bold tracking-widest uppercase mb-6 border-violet-500/30 text-violet-400">
            Unlock Premium
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-black leading-tight mb-6 bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            GO PREMIUM
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Experience anime like never before with exclusive content, ad-free
            streaming, and premium features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`relative glass-card-modern p-6 sm:p-8 rounded-3xl cursor-pointer transition-all duration-300 ${
                selectedPlan === key
                  ? "ring-2 ring-violet-500 scale-[1.02]"
                  : "hover:scale-[1.01] opacity-70 hover:opacity-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full text-xs font-bold tracking-wider">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === key
                      ? "border-violet-500 bg-violet-500"
                      : "border-white/30"
                  }`}
                >
                  {selectedPlan === key && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-black">
                  {plan.price}
                </span>
                <span className="text-white/40">{plan.period}</span>
                {plan.savings && (
                  <span className="ml-3 px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full">
                    {plan.savings}
                  </span>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <svg
                      className="w-5 h-5 text-violet-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="glass-card-modern p-6 sm:p-8 rounded-3xl max-w-md mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/50 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl font-bold text-base sm:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                Processing...
              </>
            ) : (
              <>
                Subscribe Now
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-white/30">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/30 text-sm">
            Questions?{" "}
            <a href="#" className="text-violet-400 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
