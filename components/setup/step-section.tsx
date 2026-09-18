import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StepSectionProps = {
  title: string;
  description?: string;
  /** Beginner-friendly explanation shown in a tooltip. */
  help?: string;
  /** Optional id so the section can label its options group. */
  id?: string;
  children: React.ReactNode;
};

export function StepSection({ title, description, help, id, children }: StepSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-1.5">
          <h3 id={id} className="text-base font-semibold">
            {title}
          </h3>
          {help && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  aria-label={`What is ${title.toLowerCase()}?`}
                >
                  <CircleHelp className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-pretty">{help}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-muted-foreground">{description}</p>
    </div>
  );
}
