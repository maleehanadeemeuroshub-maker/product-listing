import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, LogOut, Package, Loader2, KeyRound, MapPin, Trash2, Plus, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resendVerificationEmail, changePassword } from "../services/auth";
import { getOrders } from "../services/orders";
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from "../services/addresses";
import UserAvatar from "../components/UserAvatar";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { isStrongEnough } from "../utils/passwordStrength";
import usePageTitle from "../hooks/usePageTitle";

export default function Profile() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  usePageTitle("My Profile");

  const [orderCount, setOrderCount] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", fullName: "", phone: "", line1: "", city: "", state: "", zip: "", country: "" });
  const [addressErrors, setAddressErrors] = useState({});
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    getOrders()
      .then((orders) => setOrderCount(orders.length))
      .catch(() => setOrderCount(0));
    getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleLogout() {
    logout();
    navigate("/products");
  }

  async function handleResend() {
    setResending(true);
    try {
      const data = await resendVerificationEmail();
      toast.success(data.message || "Verification email sent!");
      setResendCooldown(data.retryAfter || 60);
    } catch (err) {
      toast.error(err.message || "Could not send verification email.");
      if (err.data?.retryAfter) setResendCooldown(err.data.retryAfter);
    } finally {
      setResending(false);
    }
  }

  function validatePasswordForm() {
    const errors = {};
    if (!currentPassword) errors.currentPassword = "Required";
    if (!isStrongEnough(newPassword)) errors.newPassword = "At least 8 characters, with a letter and a number";
    if (newPassword !== confirmNewPassword) errors.confirmNewPassword = "Passwords don't match";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password updated! A confirmation email was sent.");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(err.message || "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  function validateAddressForm() {
    const errors = {};
    if (!newAddress.fullName.trim()) errors.fullName = "Required";
    if (!newAddress.phone.trim()) errors.phone = "Required";
    if (!newAddress.line1.trim()) errors.line1 = "Required";
    if (!newAddress.city.trim()) errors.city = "Required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleAddAddress(e) {
    e.preventDefault();
    if (!validateAddressForm()) return;

    setSavingAddress(true);
    try {
      const updated = await addAddress(newAddress);
      setAddresses(updated);
      setShowAddAddress(false);
      setNewAddress({ label: "Home", fullName: "", phone: "", line1: "", city: "", state: "", zip: "", country: "" });
      toast.success("Address saved.");
    } catch (err) {
      toast.error(err.message || "Could not save address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(id) {
    try {
      const updated = await deleteAddress(id);
      setAddresses(updated);
      toast.info("Address removed.");
    } catch (err) {
      toast.error(err.message || "Could not remove address.");
    }
  }

  async function handleSetDefaultAddress(id) {
    try {
      const updated = await setDefaultAddress(id);
      setAddresses(updated);
    } catch (err) {
      toast.error(err.message || "Could not update default address.");
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <UserAvatar name={user.fullName} size={72} ringed />
          <div>
            <h1 className="text-xl font-extrabold text-base-100">{user.fullName}</h1>
            <p className="text-sm text-base-400">{user.email}</p>
            <p className="mt-1 text-xs text-base-400">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          </div>
        </div>

        {!user.emailVerified && (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-400">Email Not Verified</p>
                <p className="text-xs text-base-400">Verify your email to unlock the full experience.</p>
              </div>
            </div>
            <button
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="shrink-0 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/25 disabled:opacity-50"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resending
                  ? "Sending..."
                  : "Resend Verification Email"}
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/orders"
            className="flex items-center justify-between rounded-xl border border-overlay/8 bg-base-900 p-4 transition hover:border-overlay/20"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-base-100">
              <Package size={16} className="text-accent-400" /> Order History
            </span>
            <span className="text-sm text-base-400">{orderCount === null ? <Loader2 size={14} className="animate-spin" /> : orderCount}</span>
          </Link>

          <button
            onClick={() => setShowChangePassword((v) => !v)}
            className="flex items-center justify-between rounded-xl border border-overlay/8 bg-base-900 p-4 text-left transition hover:border-overlay/20"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-base-100">
              <KeyRound size={16} className="text-accent-400" /> Change Password
            </span>
          </button>
        </div>

        {showChangePassword && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleChangePassword}
            className="mt-4 flex flex-col gap-4 overflow-hidden rounded-xl border border-overlay/8 bg-base-900 p-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-base-300">Current Password</label>
              <PasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="••••••••"
                autoComplete="current-password"
                hasError={Boolean(passwordErrors.currentPassword)}
              />
              {passwordErrors.currentPassword && <span className="text-xs text-red-400">{passwordErrors.currentPassword}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-base-300">New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder="••••••••"
                autoComplete="new-password"
                hasError={Boolean(passwordErrors.newPassword)}
              />
              <PasswordStrengthMeter password={newPassword} />
              {passwordErrors.newPassword && <span className="text-xs text-red-400">{passwordErrors.newPassword}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-base-300">Confirm New Password</label>
              <PasswordInput
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                placeholder="••••••••"
                autoComplete="new-password"
                hasError={Boolean(passwordErrors.confirmNewPassword)}
              />
              {passwordErrors.confirmNewPassword && (
                <span className="text-xs text-red-400">{passwordErrors.confirmNewPassword}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {savingPassword ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
            </button>
          </motion.form>
        )}

        <div className="mt-6 rounded-xl border border-overlay/8 bg-base-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-base-100">
              <MapPin size={16} className="text-accent-400" /> Saved Addresses
            </h2>
            <button
              onClick={() => setShowAddAddress((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-accent-400 hover:text-accent-300"
            >
              <Plus size={13} /> Add Address
            </button>
          </div>

          {addresses.length === 0 && !showAddAddress && (
            <p className="text-xs text-base-400">No saved addresses yet — add one to speed up checkout.</p>
          )}

          <div className="flex flex-col gap-2">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between gap-3 rounded-lg border border-overlay/8 bg-base-850 p-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base-100">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-bold text-accent-400">DEFAULT</span>
                    )}
                  </div>
                  <p className="text-xs text-base-400">{addr.fullName} &middot; {addr.phone}</p>
                  <p className="text-xs text-base-400">
                    {addr.line1}, {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      title="Set as default"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-base-400 transition hover:bg-overlay/5 hover:text-accent-400"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    title="Remove"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-base-400 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showAddAddress && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleAddAddress}
              className="mt-4 grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2"
            >
              <input
                placeholder="Full Name"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className={`rounded-lg border bg-base-850 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 ${addressErrors.fullName ? "border-red-500/50" : "border-overlay/8"}`}
              />
              <input
                placeholder="Phone Number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className={`rounded-lg border bg-base-850 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 ${addressErrors.phone ? "border-red-500/50" : "border-overlay/8"}`}
              />
              <input
                placeholder="Address Line"
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                className={`sm:col-span-2 rounded-lg border bg-base-850 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 ${addressErrors.line1 ? "border-red-500/50" : "border-overlay/8"}`}
              />
              <input
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className={`rounded-lg border bg-base-850 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 ${addressErrors.city ? "border-red-500/50" : "border-overlay/8"}`}
              />
              <input
                placeholder="State / Province"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="rounded-lg border border-overlay/8 bg-base-850 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
              <input
                placeholder="ZIP / Postal Code"
                value={newAddress.zip}
                onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                className="rounded-lg border border-overlay/8 bg-base-850 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
              <input
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                className="rounded-lg border border-overlay/8 bg-base-850 px-3.5 py-2.5 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
              <button
                type="submit"
                disabled={savingAddress}
                className="sm:col-span-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {savingAddress ? <Loader2 size={16} className="animate-spin" /> : "Save Address"}
              </button>
            </motion.form>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-overlay/8 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut size={15} /> Logout
        </button>
      </motion.div>
    </div>
  );
}
