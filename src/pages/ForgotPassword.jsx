import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Backend always responds generically here, so this only fires on network failure.
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/10">
                <MailCheck size={28} className="text-accent-400" />
              </span>
              <h1 className="text-xl font-extrabold text-base-100">Check your email</h1>
              <p className="text-sm text-base-400">
                If an account exists for <span className="font-semibold text-base-100">{email}</span>, we've sent a
                password reset link. It expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="mt-2 w-full rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Back to Login
              </Link>
              <Link to="/dev/inbox" className="text-xs text-accent2-400 hover:text-accent2-300">
                View the dev email inbox
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent2-500 shadow-lg shadow-accent-500/25">
                  <KeyRound size={22} className="text-white" />
                </span>
                <h1 className="text-2xl font-extrabold text-base-100">Forgot password?</h1>
                <p className="text-sm text-base-400">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="glass flex flex-col gap-4 rounded-2xl p-6">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-base-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`rounded-lg border bg-base-900 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 transition focus:outline-none focus:ring-2 ${
                      error ? "border-red-500/50 focus:ring-red-500/20" : "border-overlay/8 focus:border-accent-500/50 focus:ring-accent-500/20"
                    }`}
                  />
                  {error && <span className="text-xs text-red-400">{error}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-base-400 hover:text-base-100"
                >
                  <ArrowLeft size={13} /> Back to Login
                </Link>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
