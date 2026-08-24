export function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Returns a 0-4 strength score plus a human label — mirrored on the frontend for live feedback. */
export function scorePassword(password = "") {
  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length - 1; // 0-4
  const clamped = Math.max(0, Math.min(4, score));
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score: clamped, label: labels[clamped], checks };
}

export function isStrongEnough(password = "") {
  return password.length >= 8 && /[a-z]/i.test(password) && /[0-9]/.test(password);
}
