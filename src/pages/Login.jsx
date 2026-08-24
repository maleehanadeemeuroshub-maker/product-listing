import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, ShoppingBag, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";
import usePageTitle from "../hooks/usePageTitle";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  usePageTitle("Login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || "/products"} replace />;
  }

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back!");
      navigate(location.state?.from || "/products", { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent2-500 shadow-lg shadow-accent-500/25">
            <ShoppingBag size={22} className="text-white" />
          </span>
          <h1 className="text-2xl font-extrabold text-base-100">Welcome back</h1>
          <p className="text-sm text-base-400">Sign in to continue to Shoply</p>
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
                fieldErrors.email
                  ? "border-red-500/50 focus:ring-red-500/20"
                  : "border-overlay/8 focus:border-accent-500/50 focus:ring-accent-500/20"
              }`}
            />
            {fieldErrors.email && <span className="text-xs text-red-400">{fieldErrors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-base-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-accent-400 hover:text-accent-300">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
              hasError={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && <span className="text-xs text-red-400">{fieldErrors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} /> Login
              </>
            )}
          </button>

          <p className="text-center text-xs text-base-400">
            New to Shoply?{" "}
            <Link to="/register" className="font-semibold text-accent-400 hover:text-accent-300">
              Create an account
            </Link>
          </p>
          <p className="text-center text-[11px] text-base-400">
            Testing locally?{" "}
            <Link to="/dev/inbox" className="text-accent2-400 hover:text-accent2-300">
              View the dev email inbox
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
