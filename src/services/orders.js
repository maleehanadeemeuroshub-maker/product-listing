import authApi from "./auth";

/** items: the cart array — server recomputes totals rather than trusting the client. */
export async function createOrder(items, { couponCode, shippingAddress } = {}) {
  const { data } = await authApi.post("/orders", { items, couponCode, shippingAddress });
  return data.order;
}

export async function getOrders() {
  const { data } = await authApi.get("/orders");
  return data.orders;
}

export async function getOrderById(id) {
  const { data } = await authApi.get(`/orders/${id}`);
  return data.order;
}

export async function cancelOrder(id) {
  const { data } = await authApi.post(`/orders/${id}/cancel`);
  return data.order;
}

export async function validateCoupon(code) {
  const { data } = await authApi.post("/orders/validate-coupon", { code });
  return data; // { code, discountPercent, description }
}
