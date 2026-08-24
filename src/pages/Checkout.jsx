import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ShoppingBag, ArrowLeft, Tag, X, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createOrder, validateCoupon } from "../services/orders";
import { getAddresses, addAddress } from "../services/addresses";
import EmptyState from "../components/EmptyState";
import usePageTitle from "../hooks/usePageTitle";

const EMPTY_ADDRESS = { label: "Home", fullName: "", phone: "", line1: "", city: "", state: "", zip: "", country: "" };

export default function Checkout() {
  usePageTitle("Checkout");

  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ ...EMPTY_ADDRESS, fullName: user?.fullName || "" });
  const [saveAddress, setSaveAddress] = useState(true);
  const [addressErrors, setAddressErrors] = useState({});

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    getAddresses()
      .then((data) => {
        setAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr ? defaultAddr.id : "new");
      })
      .catch(() => setSelectedAddressId("new"));
  }, []);

  const discountAmount = appliedCoupon ? totalPrice * (appliedCoupon.discountPercent / 100) : 0;
  const finalTotal = totalPrice - discountAmount;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const coupon = await validateCoupon(couponInput.trim());
      setAppliedCoupon(coupon);
      toast.success(coupon.description);
    } catch (err) {
      toast.error(err.message || "Invalid coupon code.");
    } finally {
      setCouponLoading(false);
    }
  }

  function validateNewAddress() {
    const errors = {};
    if (!newAddress.fullName.trim()) errors.fullName = "Required";
    if (!newAddress.phone.trim()) errors.phone = "Required";
    if (!newAddress.line1.trim()) errors.line1 = "Required";
    if (!newAddress.city.trim()) errors.city = "Required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePlaceOrder() {
    let shippingAddress;

    if (selectedAddressId === "new") {
      if (!validateNewAddress()) return;
      shippingAddress = newAddress;
    } else {
      shippingAddress = addresses.find((a) => a.id === selectedAddressId);
    }

    setPlacing(true);
    try {
      const order = await createOrder(cart, { couponCode: appliedCoupon?.code, shippingAddress });

      if (selectedAddressId === "new" && saveAddress) {
        addAddress(newAddress).catch(() => {
          /* saving for next time is a convenience, not critical to order success */
        });
      }

      clearCart();
      toast.success("Order placed! A confirmation email is on its way.");
      navigate("/order-success", { state: { order }, replace: true });
    } catch (err) {
      toast.error(err.message || "Could not place your order.");
    } finally {
      setPlacing(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add a few products before checking out."
          action={
            <Link to="/products" className="rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2 text-sm font-semibold text-white">
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/cart" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-base-400 hover:text-base-100">
        <ArrowLeft size={16} /> Back to cart
      </Link>

      <h1 className="mb-2 text-2xl font-extrabold text-base-100 sm:text-3xl">
        Review &amp; <span className="text-gradient">Checkout</span>
      </h1>
      <p className="mb-8 text-sm text-base-400">Placing order as {user.fullName} ({user.email})</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Shipping address */}
          <div className="rounded-2xl border border-overlay/8 bg-base-900 p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-base-400">Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                      selectedAddressId === addr.id ? "border-accent-500/50 bg-accent-500/5" : "border-overlay/8 hover:border-overlay/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 accent-accent-500"
                    />
                    <div>
                      <span className="font-semibold text-base-100">{addr.label}</span>
                      <span className="ml-2 text-xs text-base-400">{addr.fullName} &middot; {addr.phone}</span>
                      <p className="text-xs text-base-400">
                        {addr.line1}, {addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip}
                      </p>
                    </div>
                  </label>
                ))}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                    selectedAddressId === "new" ? "border-accent-500/50 bg-accent-500/5" : "border-overlay/8 hover:border-overlay/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === "new"}
                    onChange={() => setSelectedAddressId("new")}
                    className="accent-accent-500"
                  />
                  <span className="font-medium text-base-100">Use a new address</span>
                </label>
              </div>
            )}

            {selectedAddressId === "new" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <label className="flex items-center gap-2 text-xs text-base-400 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 rounded border-overlay/20 bg-base-850 accent-accent-500"
                  />
                  Save this address for next time
                </label>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="rounded-2xl border border-overlay/8 bg-base-900 p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-base-400">Order Items</h2>
            <div className="flex flex-col gap-4">
              {cart.map((item) => {
                const discounted = item.price * (1 - item.discountPercentage / 100);
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.thumbnail} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-base-100">{item.title}</p>
                      <p className="text-xs text-base-400">Qty {item.quantity} &times; ${discounted.toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-semibold text-base-100">${(discounted * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-overlay/8 bg-base-900 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-base-400">Order Summary</h2>

          {appliedCoupon ? (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check size={13} /> {appliedCoupon.code} applied
              </span>
              <button onClick={() => setAppliedCoupon(null)} className="text-base-400 hover:text-red-400">
                <X size={13} />
              </button>
            </div>
          ) : (
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full rounded-lg border border-overlay/8 bg-base-850 py-2 pl-8 pr-2 text-xs text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="rounded-lg border border-overlay/10 px-3 text-xs font-semibold text-base-100 transition hover:border-overlay/20 disabled:opacity-50"
              >
                {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-base-300">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base-300">
              <span>Shipping</span>
              <span className="text-emerald-400">Free</span>
            </div>
          </div>
          <div className="my-4 h-px bg-overlay/8" />
          <div className="flex justify-between text-base font-bold text-base-100">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition hover:opacity-90 disabled:opacity-60"
          >
            {placing ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Placing order...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
