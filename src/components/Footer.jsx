import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-overlay/8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent2-500">
            <ShoppingBag size={15} className="text-white" />
          </span>
          <span className="text-sm font-extrabold text-base-100">
            Shop<span className="text-gradient">ly</span>
          </span>
        </Link>
        <p className="text-xs text-base-400">
          Built for a frontend internship project — React, Vite, Tailwind, Three.js &amp; a real REST API.
        </p>
        <p className="text-xs text-base-400">© {new Date().getFullYear()} Shoply. All rights reserved.</p>
      </div>
    </footer>
  );
}
