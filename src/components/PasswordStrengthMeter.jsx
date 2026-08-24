import { scorePassword } from "../utils/passwordStrength";

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;
  const { score, label, color } = scorePassword(password);

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= score ? color : "var(--color-base-700)" }}
          />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
