import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { guides } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Automation Guides — AutoSetup",
  description:
    "Plain-language guides for manual testers moving into automation: choosing a tool, the Page Object Model, reading test reports and your first week with a project.",
};

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="Automation Guides"
        title="Guides for testers starting automation"
        description="Short, practical reading written for manual testers. No prior coding assumed, and nothing padded out."
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Card
              key={guide.slug}
              className="group gap-3 py-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-primary/40"
            >
              <CardHeader className="px-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {guide.level}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {guide.minutes} min read
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">
                  <Link href={`/guides/${guide.slug}`} className="after:absolute after:inset-0">
                    {guide.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col px-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {guide.description}
                </p>
                <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  Read guide
                  <ArrowRight className="size-4 opacity-50 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
