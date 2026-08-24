import axios from "axios";

const STORAGE_KEY = "shoply_auth";

// Talks to our own backend (api/ serverless functions) — never to Resend or
// any other third-party service directly. Requests go through Vite's /api
// proxy in dev and are same-origin in production.
const authApi = axios.create({ baseURL: "/api", timeout: 10000 });

authApi.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
    const err = new Error(message);
    err.status = error.response?.status;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

export async function registerUser({ fullName, email, password }) {
  const { data } = await authApi.post("/auth/register", { fullName, email, password });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await authApi.post("/auth/login", { email, password });
  return data; // { token, user }
}

export async function verifyEmail(token) {
  const { data } = await authApi.get("/auth/verify-email", { params: { token } });
  return data;
}

export async function resendVerificationEmail() {
  const { data } = await authApi.post("/auth/resend-verification");
  return data;
}

export async function forgotPassword(email) {
  const { data } = await authApi.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword({ token, password }) {
  const { data } = await authApi.post("/auth/reset-password", { token, password });
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await authApi.post("/auth/change-password", { currentPassword, newPassword });
  return data;
}

export async function getCurrentUser() {
  const { data } = await authApi.get("/auth/me");
  return data.user;
}

export default authApi;
