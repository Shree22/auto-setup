import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tag = "Beginner Friendly" | "Enterprise" | "Modern";

const tagStyles: Record<Tag, string> = {
  "Beginner Friendly": "bg-success/10 text-success",
  Enterprise: "bg-primary/10 text-primary",
  Modern: "bg-brand-purple/10 text-brand-purple",
};

const stacks: { tool: string; language: string; parts: string[]; tag: Tag; href: string }[] = [
  { tool: "Selenium", language: "Python", parts: ["Pytest", "POM", "Allure"], tag: "Beginner Friendly", href: "/setup?tool=selenium&language=python&framework=pytest&structure=pom" },
  { tool: "Selenium", language: "Java", parts: ["TestNG", "POM", "Maven"], tag: "Enterprise", href: "/setup?tool=selenium&language=java&framework=testng&structure=pom" },
  { tool: "Playwright", language: "Python", parts: ["Pytest", "POM"], tag: "Modern", href: "/setup?tool=playwright&language=python&framework=pytest&structure=pom" },
  { tool: "Playwright", language: "TypeScript", parts: ["Playwright Test", "POM"], tag: "Modern", href: "/setup?tool=playwright&language=typescript&framework=playwright-test&structure=pom" },
];

export function PopularStacks() {
  return (
    <section className="bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Starter stacks"
          title="Popular Automation Setups"
          description="Proven combinations to get you from zero to your first automated test."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stacks.map((stack) => (
            <Card
              key={`${stack.tool}-${stack.language}`}
              className="gap-5 pt-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardHeader className="px-6">
                <Badge className={cn("mb-3 rounded-full px-2.5", tagStyles[stack.tag])}>
                  {stack.tag}
                </Badge>
                <CardTitle className="text-lg font-semibold">
                  {stack.tool} <span className="text-muted-foreground">+</span>{" "}
                  {stack.language}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 px-6">
                <ul className="flex flex-wrap gap-1.5">
                  {stack.parts.map((part) => (
                    <li
                      key={part}
                      className="rounded-md border bg-muted/60 px-2 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {part}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-transparent px-3 py-2">
                <Button
                  asChild
                  variant="ghost"
                  className="group/explore h-9 w-full justify-between text-primary hover:bg-primary/5 hover:text-primary"
                >
                  <Link href={stack.href}>
                    Explore Setup
                    <ArrowRight className="transition-transform group-hover/explore:translate-x-0.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
