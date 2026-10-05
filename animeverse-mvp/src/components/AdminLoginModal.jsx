import React, { useState } from "react";
import { signInAdmin } from "../services/adminAuth";

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setError("");
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      // Firebase Auth is the ONLY credential check here. There is deliberately
      // no build-time password comparison: VITE_* values are inlined into the
      // public bundle, so requiring one would force the real account password to
      // be a publicly readable string and hand out write access to every
      // visitor. Write access is gated by the admin custom claim in
      // firestore.rules / storage.rules instead.
      await signInAdmin(email.trim(), password);
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Admin sign-in failed:", err);
      const code = err && err.code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Those admin credentials were not recognised.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait and try again.");
      } else if (code === "auth/operation-not-allowed") {
        setError(
          "Email/password sign-in is not enabled for this Firebase project."
        );
      } else {
        setError("Could not sign in. Please try again.");
      }
      setPassword("");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-xl border border-anime-pink/30 bg-anime-dark p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-2xl text-white/60 transition-colors hover:text-white"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="mb-2 bg-gradient-anime bg-clip-text text-2xl font-bold text-transparent">
          Admin Access
        </h2>
        <p className="mb-6 text-sm text-anime-muted">
          Sign in with your administrator account to upload characters
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-anime-pink focus:outline-none focus:ring-2 focus:ring-anime-pink/50"
              autoFocus
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-white">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-anime-pink focus:outline-none focus:ring-2 focus:ring-anime-pink/50"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-gradient-anime px-4 py-2 font-bold text-anime-dark shadow-lg shadow-anime-pink/30 transition-all hover:-translate-y-0.5 hover:shadow-anime-pink/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? "Signing in…" : "Login"}
            </button>
          </div>
        </form>

        {/* Hint for viewers */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-center text-xs text-white/40">
            No password? Browse as viewer only
          </p>
        </div>
      </div>
    </div>
  );
}