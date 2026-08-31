import React, { useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  User,
  Mail as MailIcon,
  MapPin,
  ShieldCheck,
  LogOut,
  Sparkles,
  Camera,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function UserProfileDrawer() {
  const {
    user,
    isProfileDrawerOpen,
    setIsProfileDrawerOpen,
    logout,
    updateAvatar,
  } = useStore();

  const fileInputRef = useRef(null);

  if (!isProfileDrawerOpen || !user) return null;

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) updateAvatar(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsProfileDrawerOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-900/10 p-6 flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900/10 shrink-0">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900">
                Member Profile
              </h2>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setIsProfileDrawerOpen(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 py-4">
            
            {/* Profile Avatar Card */}
            <div className="p-4 rounded-3xl glass-panel border border-cyan-500/30 flex items-center gap-4">
              <button
                onClick={handleAvatarClick}
                className="relative w-14 h-14 rounded-2xl shrink-0 group"
                title="Change avatar"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-cyan-400/40 shadow-lg shadow-cyan-500/20"
                />
                <span className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  {user.name}
                </h3>
                <p className="text-xs font-mono text-slate-500">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>{user.role}</span>
                </div>
              </div>
            </div>

            {/* Order confirmation note — Shopify's hosted checkout now owns real
                order records; we no longer fabricate an order history here. */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 flex items-start gap-3">
              <MailIcon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600">
                Order confirmations and tracking are sent to your email after checkout.
              </p>
            </div>

            {/* Saved Shipping Address */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 font-semibold">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Express Shipping Address</span>
              </div>
              <p className="text-xs text-slate-600">
                742 Evergreen Cyber Terrace, Suite 400<br />
                Neo San Francisco, CA 94105
              </p>
            </div>

            {/* Hardware Warranty Protection Status */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">AURA Care+ Active</span>
                  <span className="text-[10px] font-mono text-slate-500">3-Year Unlimited Damage Coverage</span>
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-bold">Active</span>
            </div>

          </div>

          {/* Logout Action */}
          <div className="pt-4 border-t border-slate-900/10 shrink-0">
            <button
              onClick={logout}
              className="w-full py-3 rounded-2xl glass-panel border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Session</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
