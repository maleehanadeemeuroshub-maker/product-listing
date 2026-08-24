import { PackageSearch } from "lucide-react";

export default function EmptyState({ icon: Icon = PackageSearch, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-overlay/8 bg-base-900 px-6 py-16 text-center animate-fade-in">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-overlay/5">
        <Icon size={26} className="text-base-400" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-base-100">{title}</h3>
        {message && <p className="mt-1 max-w-sm text-sm text-base-400">{message}</p>}
      </div>
      {action}
    </div>
  );
}
