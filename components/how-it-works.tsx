import { SectionHeading } from "@/components/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    title: "Choose Your Tool",
    description:
      "Select Selenium, Playwright, Cypress, or another supported automation technology.",
  },
  {
    title: "Choose Your Stack",
    description:
      "Select language, test framework, browser and additional tools.",
  },
  {
    title: "Customize Your Structure",
    description:
      "Choose a basic, Page Object Model, or advanced project structure.",
  },
  {
    title: "Start Automating",
    description: "Get a structured automation project ready for development.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From Manual Testing to Automation"
          description="Four simple steps. No framework setup confusion."
        />

        <ol className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Desktop connector line through the step numbers */}
          <div
            aria-hidden
            className="absolute top-6 right-[12.5%] left-[12.5%] hidden h-px bg-linear-to-r from-primary/40 via-brand-purple/40 to-primary/40 lg:block"
          />
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex flex-col lg:items-center">
              <span className="relative z-10 mb-5 flex size-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background font-mono text-sm font-semibold text-primary shadow-xs">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Card className="w-full flex-1 gap-2 py-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md lg:text-center">
                <CardHeader className="px-6">
                  <CardTitle className="text-base font-semibold">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <CardDescription className="leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
