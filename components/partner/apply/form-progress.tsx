import { cn } from "@/lib/utils";
import { APPLICATION_STEPS } from "@/lib/types/property-application";
import { Check } from "lucide-react";

interface FormProgressProps {
  currentStep: number; // 0-indexed
}

export function FormProgress({ currentStep }: FormProgressProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2 mb-8">
      {APPLICATION_STEPS.map((label, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;

        return (
          <li key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium border",
                isComplete && "bg-emerald border-emerald text-ivory",
                isActive && "border-emerald text-emerald",
                !isComplete && !isActive && "border-charcoal/20 text-charcoal/40"
              )}
            >
              {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:inline",
                isActive ? "text-charcoal font-medium" : "text-charcoal/50"
              )}
            >
              {label}
            </span>
            {index < APPLICATION_STEPS.length - 1 && (
              <div className="w-4 h-px bg-charcoal/15 mx-1" />
            )}
          </li>
        );
      })}
    </ol>
  );
}