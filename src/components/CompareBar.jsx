import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare } from "../context/CompareContext";

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {compareItems.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-overlay/10 glass"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <span className="flex items-center gap-2 text-sm font-semibold text-base-100">
              <GitCompareArrows size={16} className="text-accent-400" />
              Compare ({compareItems.length}/3)
            </span>

            <div className="flex flex-1 flex-wrap items-center gap-2">
              {compareItems.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-1.5 rounded-lg border border-overlay/10 bg-base-900 py-1 pl-1 pr-2 text-xs text-base-300"
                >
                  <img src={item.thumbnail} alt={item.title} className="h-6 w-6 rounded object-cover" />
                  <span className="max-w-[100px] truncate">{item.title}</span>
                  <button onClick={() => removeFromCompare(item.id)} className="text-base-400 hover:text-red-400">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={clearCompare} className="text-xs font-medium text-base-400 hover:text-base-100">
                Clear
              </button>
              <button
                onClick={() => navigate("/compare")}
                disabled={compareItems.length < 2}
                className="rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Compare Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
