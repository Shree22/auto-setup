import { Cog } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/#home" }: { className?: string; href?: string }) {
  return (
    <a href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Cog className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight">AutoSetup</span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">
          From Manual to Automation
        </span>
      </span>
    </a>
  );
}
