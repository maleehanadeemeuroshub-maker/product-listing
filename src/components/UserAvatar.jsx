function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return initials.join("") || "U";
}

export default function UserAvatar({ name, size = 32, ringed = false }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent2-500 font-bold text-white ${
        ringed ? "ring-2 ring-white/10" : ""
      }`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsOf(name)}
    </span>
  );
}
