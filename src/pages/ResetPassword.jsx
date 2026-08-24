import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { resetPassword } from "../services/auth";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { isStrongEnough } from "../utils/passwordStrength";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="relative flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
        <div className="glass flex max-w-sm flex-col items-center gap-4 rounded-2xl p-8 text-center">
          <h1 className="text-lg font-bold text-base-100">Invalid reset link</h1>
          <p className="text-sm text-base-400">This password reset link is missing its token. Please request a new one.</p>
          <Link to="/forgot-password" className="rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2 text-sm font-semibold text-white">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  function validate() {
    const errors = {};
    if (!isStrongEnough(password)) errors.password = "At least 8 characters, with a letter and a number";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
      toast.success("Password reset! Please log in.");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      toast.error(err.message || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-sm">
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10"
            >
              <CheckCircle2 size={28} className="text-emerald-400" />
            </motion.span>
            <h1 className="text-xl font-extrabold text-base-100">Password updated</h1>
            <p className="text-sm text-base-400">Redirecting you to login...</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent2-500 shadow-lg shadow-accent-500/25">
                <ShieldCheck size={22} className="text-white" />
              </span>
              <h1 className="text-2xl font-extrabold text-base-100">Reset your password</h1>
              <p className="text-sm text-base-400">Choose a new, strong password</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="glass flex flex-col gap-4 rounded-2xl p-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-base-300">
                  New Password
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  hasError={Boolean(fieldErrors.password)}
                />
                <PasswordStrengthMeter password={password} />
                {fieldErrors.password && <span className="text-xs text-red-400">{fieldErrors.password}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-base-300">
                  Confirm Password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  hasError={Boolean(fieldErrors.confirmPassword)}
                />
                {fieldErrors.confirmPassword && (
                  <span className="text-xs text-red-400">{fieldErrors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
