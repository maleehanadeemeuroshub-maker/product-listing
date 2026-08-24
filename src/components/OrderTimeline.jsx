import { Check, Package, Truck, Home } from "lucide-react";

const STEPS = [
  { key: "Confirmed", label: "Confirmed", icon: Check },
  { key: "Processing", label: "Processing", icon: Package },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: Home },
];

export default function OrderTimeline({ status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                  reached ? "border-accent-500 bg-accent-500 text-white" : "border-overlay/15 text-base-400"
                }`}
              >
                <Icon size={15} />
              </span>
              <span className={`text-[11px] font-medium ${reached ? "text-base-100" : "text-base-400"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded-full ${i < currentIndex ? "bg-accent-500" : "bg-overlay/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
