import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, ShoppingBag, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { isStrongEnough } from "../utils/passwordStrength";
import usePageTitle from "../hooks/usePageTitle";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();

  usePageTitle("Create Account");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  if (isAuthenticated) return <Navigate to="/products" replace />;

  function validate() {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address";
    if (!isStrongEnough(password)) errors.password = "At least 8 characters, with a letter and a number";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
    if (!agreedToTerms) errors.terms = "You must accept the Terms & Conditions";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      setSubmittedEmail(email.trim());
    } catch (err) {
      toast.error(err.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {submittedEmail ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/10">
                <MailCheck size={28} className="text-accent-400" />
              </span>
              <h1 className="text-xl font-extrabold text-base-100">Check your email</h1>
              <p className="text-sm text-base-400">
                We sent a verification link to <span className="font-semibold text-base-100">{submittedEmail}</span>.
                Verify your account, then log in.
              </p>
              <Link
                to="/login"
                className="mt-2 w-full rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Go to Login
              </Link>
              <Link to="/dev/inbox" className="text-xs text-accent2-400 hover:text-accent2-300">
                View the dev email inbox
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent2-500 shadow-lg shadow-accent-500/25">
                  <ShoppingBag size={22} className="text-white" />
                </span>
                <h1 className="text-2xl font-extrabold text-base-100">Create your account</h1>
                <p className="text-sm text-base-400">Join Shoply and start shopping</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="glass flex flex-col gap-4 rounded-2xl p-6">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="text-sm font-medium text-base-300">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className={`rounded-lg border bg-base-900 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 transition focus:outline-none focus:ring-2 ${
                      fieldErrors.fullName
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-overlay/8 focus:border-accent-500/50 focus:ring-accent-500/20"
                    }`}
                  />
                  {fieldErrors.fullName && <span className="text-xs text-red-400">{fieldErrors.fullName}</span>}
                </div>

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
                      fieldErrors.email
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-overlay/8 focus:border-accent-500/50 focus:ring-accent-500/20"
                    }`}
                  />
                  {fieldErrors.email && <span className="text-xs text-red-400">{fieldErrors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-base-300">
                    Password
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

                <label className="flex items-start gap-2 text-xs text-base-400">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-overlay/20 bg-base-900 accent-accent-500"
                  />
                  <span>
                    I agree to the <span className="text-accent-400">Terms &amp; Conditions</span> and{" "}
                    <span className="text-accent-400">Privacy Policy</span>.
                  </span>
                </label>
                {fieldErrors.terms && <span className="-mt-2 text-xs text-red-400">{fieldErrors.terms}</span>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Create Account
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-base-400">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-accent-400 hover:text-accent-300">
                    Log in
                  </Link>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
