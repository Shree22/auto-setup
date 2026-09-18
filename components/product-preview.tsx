import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  FileCode2,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const fields = [
  { label: "Application", value: "Web Application" },
  { label: "Technology", value: "Selenium" },
  { label: "Language", value: "Python" },
  { label: "Framework", value: "Pytest" },
  { label: "Project Structure", value: "Page Object Model", wide: true },
];

const additionalTools = ["Allure", "Screenshot on Failure", "Logging"];

const summary = [
  { label: "Tool", value: "Selenium" },
  { label: "Language", value: "Python" },
  { label: "Framework", value: "Pytest" },
  { label: "Structure", value: "POM" },
  { label: "Reporting", value: "Allure" },
];

export function ProductPreview() {
  return (
    <section className="bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product preview"
          title="Build Your Automation Stack"
          description="Pick each piece of your stack in one guided screen and see exactly what you'll get."
        />

        {/* Visual mockup only */}
        <div
          aria-hidden
          className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/5"
        >
          <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-3">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="ml-3 truncate rounded-md border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
              app.autosetup.dev/new
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px]">
            {/* Setup form */}
            <div className="p-5 sm:p-8">
              <p className="text-lg font-semibold">Automation Setup</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure your project in a few clicks.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.label} className={cn(field.wide && "sm:col-span-2")}>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      {field.label}
                    </p>
                    <div className="flex h-10 items-center justify-between rounded-lg border bg-background px-3 text-sm">
                      {field.value}
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 mb-2.5 text-xs font-medium text-muted-foreground">
                Additional Tools
              </p>
              <div className="flex flex-wrap gap-2">
                {additionalTools.map((tool) => (
                  <span
                    key={tool}
                    className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm"
                  >
                    <span className="flex size-4 items-center justify-center rounded bg-primary text-primary-foreground">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {tool}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <span className={cn(buttonVariants({ size: "lg" }), "h-10 w-full px-5 sm:w-auto")}>
                  Continue <ArrowRight data-icon="inline-end" />
                </span>
              </div>
            </div>

            {/* Summary panel */}
            <div className="border-t bg-muted/40 p-5 sm:p-8 lg:border-t-0 lg:border-l">
              <p className="text-sm font-semibold">Project Summary</p>
              <ul className="mt-4 space-y-3">
                {summary.map((item) => (
                  <li key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CircleCheck className="size-4 text-primary" />
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator className="my-5" />

              <p className="text-xs font-medium text-muted-foreground">Project structure</p>
              <pre className="mt-2 overflow-x-auto rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed text-muted-foreground">
{`my-automation/
├── pages/
├── tests/
├── utils/
├── config/
├── conftest.py
└── pytest.ini`}
              </pre>

              <div className="mt-5 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
                <FileCode2 className="size-4" />
                Ready to generate · 18 files
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
