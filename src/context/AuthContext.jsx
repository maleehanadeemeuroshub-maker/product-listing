import { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, getCurrentUser } from "../services/auth";

const AuthContext = createContext(null);
const STORAGE_KEY = "shoply_auth";

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [authLoading, setAuthLoading] = useState(true);

  function persist(next) {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
    setSession(next);
  }

  // On first load, re-validate the stored token against the server so an
  // expired/invalid session is cleared instead of silently trusted.
  useEffect(() => {
    if (!session?.token) {
      setAuthLoading(false);
      return;
    }
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (!cancelled) persist({ token: session.token, user });
      })
      .catch(() => {
        if (!cancelled) persist(null);
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Intentionally runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function register(fullName, email, password) {
    return registerUser({ fullName, email, password });
  }

  async function login(email, password) {
    const data = await loginUser({ email, password });
    persist({ token: data.token, user: data.user });
    return data.user;
  }

  function logout() {
    persist(null);
  }

  /** Optimistically patches the cached user (e.g. right after email verification). */
  function updateUser(patch) {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...patch } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const value = {
    user: session?.user || null,
    token: session?.token || null,
    isAuthenticated: Boolean(session?.token),
    authLoading,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
