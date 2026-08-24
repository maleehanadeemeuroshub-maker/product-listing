import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ id, value, onChange, placeholder, autoComplete, hasError }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border bg-base-900 px-3.5 py-2.5 pr-10 text-sm text-base-100 placeholder:text-base-400 transition focus:outline-none focus:ring-2 ${
          hasError
            ? "border-red-500/50 focus:ring-red-500/20"
            : "border-overlay/8 focus:border-accent-500/50 focus:ring-accent-500/20"
        }`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-400 transition hover:text-base-100"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
