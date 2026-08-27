import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  User,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Store,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);

    if (result.success) {
      navigate('/products');
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
      setIsSubmitting(false);
    }
  };

  // Pre-fill valid DummyJSON demo credentials
  const fillDemoAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center min-h-[75vh]">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-cyan-500/30 bg-white/95 p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 p-[1.5px] mx-auto shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Store className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-slate-900">
            Welcome to Shoply.io
          </h1>
          <p className="text-xs font-mono text-slate-500">
            DummyJSON Real REST API Authentication
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-semibold block">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. emilys"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-slate-900/10 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-semibold block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-slate-900/10 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with API...</span>
              </div>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Account Switcher Buttons */}
        <div className="pt-4 border-t border-slate-900/10 space-y-2.5">
          <span className="text-[11px] font-mono text-slate-500 block text-center font-semibold">
            1-Click Public DummyJSON Test Accounts:
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('emilys', 'emilyspass')}
              className="p-2 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15 text-[11px] font-mono transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Emily (emilys)</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('michaelw', 'michaelwpass')}
              className="p-2 rounded-xl glass-panel border border-purple-500/30 text-purple-300 hover:bg-purple-500/15 text-[11px] font-mono transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Michael (michaelw)</span>
            </button>
          </div>
        </div>

        {/* Continue as Guest */}
        <div className="text-center pt-2">
          <Link
            to="/products"
            className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            ← Skip & browse as Guest
          </Link>
        </div>

      </div>
    </div>
  );
}
