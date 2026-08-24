import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    signup,
    addToast,
  } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      if (!email || !password) {
        addToast('Please enter both email and password', 'warning');
        return;
      }
      login(email, password);
    } else if (authMode === 'signup') {
      if (!name || !email || !password) {
        addToast('Please complete all required fields', 'warning');
        return;
      }
      signup(name, email, password);
    } else if (authMode === 'forgot') {
      sound.playClick();
      addToast(`Password recovery link sent to ${email}`, 'success');
      setAuthMode('login');
    }
  };

  const handleDemoLogin = () => {
    login('developer@aura3d.io', 'demo1234');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-cyan-500/30 bg-[#090d16]/95 p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white">
              {authMode === 'login' && 'Sign In to AURA 3D'}
              {authMode === 'signup' && 'Create Spatial Account'}
              {authMode === 'forgot' && 'Reset Access Key'}
            </h2>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsAuthModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Login vs Sign Up) */}
        {authMode !== 'forgot' && (
          <div className="flex rounded-2xl p-1 bg-slate-900/80 border border-white/10">
            <button
              onClick={() => {
                sound.playClick();
                setAuthMode('login');
              }}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setAuthMode('signup');
              }}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                authMode === 'signup'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Maleeha Nadeem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="developer@aura3d.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Password
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAuthMode('forgot');
                    }}
                    className="text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    Forgot Key?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>
              {authMode === 'login' && 'Sign In to Account'}
              {authMode === 'signup' && 'Create Account'}
              {authMode === 'forgot' && 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Trigger */}
        {authMode === 'login' && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <button
              onClick={handleDemoLogin}
              type="button"
              className="w-full py-2.5 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15 text-xs font-mono transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>1-Click Demo User Login</span>
            </button>
          </div>
        )}

        {authMode === 'forgot' && (
          <button
            onClick={() => setAuthMode('login')}
            className="w-full text-center text-xs font-mono text-slate-400 hover:text-white"
          >
            ← Back to Sign In
          </button>
        )}

      </div>
    </div>
  );
}
