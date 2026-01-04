import React, { useState } from "react";
import { ADMIN_PASSWORD } from "../config/adminPassword";

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      // Save admin status to sessionStorage
      sessionStorage.setItem("isAdmin", "true");
      onSuccess();
      onClose();
      setPassword("");
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-xl border border-anime-pink/30 bg-anime-dark p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-white/60 transition-colors hover:text-white"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="mb-2 bg-gradient-anime bg-clip-text text-2xl font-bold text-transparent">
          Admin Access
        </h2>
        <p className="mb-6 text-sm text-anime-muted">
          Enter admin password to upload characters
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-anime-pink focus:outline-none focus:ring-2 focus:ring-anime-pink/50"
              autoFocus
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
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
              className="flex-1 rounded-lg bg-gradient-anime px-4 py-2 font-bold text-anime-dark shadow-lg shadow-anime-pink/30 transition-all hover:-translate-y-0.5 hover:shadow-anime-pink/50"
            >
              Login
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
