import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type OptionCardProps = {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** Small element shown top-right, e.g. a Badge. */
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

/** A large selectable card that behaves like a radio option. */
export function OptionCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  aside,
  children,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5",
        selected && "border-primary bg-primary/5 ring-1 ring-primary hover:border-primary",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors",
              selected && "bg-primary text-primary-foreground"
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 pr-6">
            <span className="font-semibold">{title}</span>
            {aside}
          </div>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute top-4 right-4 flex size-5 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background"
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}
