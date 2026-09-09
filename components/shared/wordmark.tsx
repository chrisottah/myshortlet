// components/shared/wordmark.tsx
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  variant?: "dark" | "light";
}

export function Wordmark({ className, variant = "dark" }: WordmarkProps) {
  const textColor = variant === "dark" ? "text-charcoal" : "text-ivory";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald">
        <span className="font-display text-sm font-bold text-ivory">M</span>
      </div>
      <span className={cn("font-display text-lg font-bold tracking-tight", textColor)}>
        MyShortlet
      </span>
    </div>
  );
}