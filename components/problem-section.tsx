import {
  Download,
  FolderTree,
  Layers,
  PackageSearch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const questions: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Download,
    title: "What should I install?",
    description: "Python? Java? Node?",
  },
  {
    icon: Layers,
    title: "Which framework should I use?",
    description: "Pytest? TestNG? JUnit?",
  },
  {
    icon: FolderTree,
    title: "How should I structure my project?",
    description: "Where should pages, tests, utilities and configuration go?",
  },
  {
    icon: PackageSearch,
    title: "Which packages do I need?",
    description: "Reporting? Logging? WebDriver management?",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title="Starting Automation Shouldn't Be This Complicated"
          description="Manual testers often spend hours figuring out:"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {questions.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="gap-5 py-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardHeader className="px-6">
                <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <CardDescription className="text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-5 sm:px-7">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <p className="text-base font-medium text-pretty sm:text-lg">
            <span className="font-semibold text-primary">AutoSetup</span> brings
            these decisions into one simple workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
