import { Blocks, UserRound, Wrench, Zap, type LucideIcon } from "lucide-react";

const values: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Zap, title: "Quick Setup", description: "Start automation faster" },
  { icon: Blocks, title: "Best Practices", description: "Pre-structured framework" },
  { icon: UserRound, title: "Beginner Friendly", description: "Made for manual testers" },
  { icon: Wrench, title: "Multiple Tools", description: "Selenium, Playwright & more" },
];

export function ValueStrip() {
  return (
    <section aria-label="Why AutoSetup" className="border-y bg-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {values.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card text-primary shadow-xs">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold sm:text-base">{title}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
