import {
  BookOpen,
  Building2,
  ChartColumn,
  FlaskConical,
  SlidersHorizontal,
  Zap,
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

const features: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Zap, title: "Faster Setup", description: "Skip repetitive framework initialization." },
  { icon: Building2, title: "Clean Architecture", description: "Start with a maintainable project structure." },
  { icon: BookOpen, title: "Beginner Friendly", description: "Clear explanations for every configuration choice." },
  { icon: FlaskConical, title: "Sample Tests", description: "Start with example automation scenarios." },
  { icon: ChartColumn, title: "Reporting Ready", description: "Prepare your project for test reporting tools." },
  { icon: SlidersHorizontal, title: "Flexible Configuration", description: "Choose the tools and structure you need." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything You Need to Start Automation"
          description="A solid foundation so you can focus on writing tests, not wiring up tooling."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="gap-3 py-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardHeader className="px-7">
                <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent className="px-7">
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
