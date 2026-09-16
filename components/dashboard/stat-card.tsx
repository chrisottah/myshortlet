import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal/60">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald/10 text-emerald">
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-charcoal">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-charcoal/50">{hint}</p>}
    </div>
  );
}