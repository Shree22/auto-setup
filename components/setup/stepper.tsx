import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { STEPS } from "@/lib/setup/selection";
import { cn } from "@/lib/utils";

type StepperProps = {
  current: number;
  /** Furthest step index the user is allowed to jump to. */
  reachable: number;
  onStepClick: (index: number) => void;
};

export function Stepper({ current, reachable, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Setup progress">
      {/* Mobile: compact progress */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">{STEPS[current].title}</span>
          <span className="text-muted-foreground">
            Step {current + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={((current + 1) / STEPS.length) * 100} className="mt-3 h-1.5" />
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden items-center md:flex">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = i <= reachable && !active;
          return (
            <li key={step.id} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
              <button
                type="button"
                onClick={() => onStepClick(i)}
                disabled={!clickable}
                aria-current={active ? "step" : undefined}
                className="group flex items-center gap-3 rounded-lg p-1 pr-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-background text-primary ring-4 ring-primary/15",
                    !done && !active && "border-border bg-background text-muted-foreground",
                    clickable && !done && "group-hover:border-primary/50"
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden flex-col lg:flex">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      !done && !active && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.description}</span>
                </span>
                <span className={cn("text-sm font-semibold lg:hidden", !active && "sr-only")}>
                  {step.title}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "mx-3 h-0.5 flex-1 rounded-full transition-colors",
                    i < current ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
