import {
  ArrowRight,
  Check,
  CircleCheck,
  FileCode2,
  Globe,
  Rocket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  "Beginner Friendly",
  "Best-practice structure",
  "Multiple automation tools",
];

export function Hero() {
  return (
    <section id="home" className="relative scroll-mt-16">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] bg-size-[48px_48px] opacity-60"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="animate-fade-up">
          <Badge
            variant="outline"
            className="h-7 gap-1.5 rounded-full border-primary/20 bg-primary/5 px-3 text-primary"
          >
            <Rocket />
            Built for Manual Test Engineers
          </Badge>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1] xl:text-[3.25rem]">
            Manual Tester <span className="text-muted-foreground">→</span>
            <span className="mt-1 block bg-linear-to-r from-primary to-brand-purple bg-clip-text pb-1 text-transparent">
              Automation Framework in 2 Minutes
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            Set up your automation framework without starting from scratch.
            Choose your technology, language, framework, and tools — and get a
            ready-to-use project structure.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 text-[15px]">
              <a href="/setup">
                Get Started <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 px-6 text-[15px]"
            >
              <a href="#tools">Explore Tools</a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-col gap-2.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-lg animate-fade-up [animation-delay:150ms] lg:mr-0"
    >
      {/* Soft backdrop shape */}
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/5 sm:-inset-6" />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/5">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b bg-muted/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="size-2.5 rounded-full bg-primary" />
            AutoSetup
          </div>
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Choose your automation stack</p>
            <span className="font-mono text-xs text-muted-foreground">
              Step 2 / 4
            </span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < 2 ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Selected tool */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3.5 ring-1 ring-primary/10">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Globe className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Selenium</p>
              <p className="text-xs text-muted-foreground">Python + Pytest</p>
            </div>
            <CircleCheck className="size-5 text-primary" />
          </div>

          {/* Options */}
          <div className="mt-3 grid gap-2">
            {["Page Object Model", "Allure Reporting"].map((opt) => (
              <div
                key={opt}
                className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
              >
                <span className="flex size-5 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm font-medium">{opt}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground sm:flex">
              <FileCode2 className="size-3.5" /> selenium-python-pytest
            </span>
            <span
              className={cn(
                buttonVariants({ size: "lg" }),
                "ml-auto h-10 px-5"
              )}
            >
              Generate Project
            </span>
          </div>
        </div>
      </div>

      {/* Floating success card */}
      <div className="absolute -bottom-6 left-3 flex animate-float items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg sm:-left-8">
        <span className="flex size-9 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="size-5" strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-sm font-semibold">Framework Ready</p>
          <p className="text-xs text-muted-foreground">18 files generated</p>
        </div>
      </div>
    </div>
  );
}
