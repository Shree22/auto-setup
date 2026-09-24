import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Drama,
  Globe,
  Smartphone,
  TreePine,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

const tools: { name: string; description: string; icon: LucideIcon; href: string }[] = [
  { name: "Selenium", description: "Web browser automation", icon: Globe, href: "/setup?tool=selenium" },
  { name: "Playwright", description: "Modern end-to-end testing", icon: Drama, href: "/setup?tool=playwright" },
  { name: "Cypress", description: "Fast web testing", icon: TreePine, href: "/setup?tool=cypress" },
  { name: "Robot Framework", description: "Keyword-driven automation", icon: Bot, href: "/setup?tool=robot" },
  { name: "Appium", description: "Mobile application automation", icon: Smartphone, href: "/setup?tool=appium" },
  { name: "REST Assured", description: "API testing with Java", icon: Webhook, href: "/setup?tool=rest-assured" },
];

export function SupportedTools() {
  return (
    <section id="tools" className="scroll-mt-16 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Supported tools"
          title="Your Favorite Automation Tools"
          description="Choose the technology that fits your testing needs."
        />

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {tools.map(({ name, description, icon: Icon, href }) => (
            <Card
              key={name}
              className="group relative py-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-primary/40 sm:py-6"
            >
              <CardContent className="flex h-full flex-col px-4 sm:px-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">
                  <Link href={href} className="after:absolute after:inset-0">
                    {name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  Learn more
                  <ArrowRight className="size-4 opacity-50 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
