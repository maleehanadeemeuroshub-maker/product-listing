// Mirrors the scoring logic in api/_lib/validate.js so the UI can give
// live feedback without a round-trip to the server.
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
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#10b981"];
  return { score: clamped, label: labels[clamped], color: colors[clamped], checks };
}

export function isStrongEnough(password = "") {
  return password.length >= 8 && /[a-z]/i.test(password) && /[0-9]/.test(password);
}
