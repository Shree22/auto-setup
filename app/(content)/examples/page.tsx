import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCode2 } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { ToolIcon } from "@/components/setup/tool-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { examples } from "@/lib/content/examples";
import { catalog } from "@/lib/setup/catalog";
import { buildPreview } from "@/lib/setup/preview";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Examples",
  description:
    "Real generated projects for Selenium, Playwright, Cypress, Robot Framework and REST Assured. Browse the actual code before you generate it.",
  path: "/examples",
});

export default function ExamplesPage() {
  return (
    <>
      <PageHero
        eyebrow="Examples"
        title="See the code before you generate it"
        description="Each example is a real project produced by AutoSetup. Browse the files, read the sample tests, then open the same setup in the wizard."
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => {
            const tool = catalog.tools.find((t) => t.id === example.selection.toolId);
            const preview = buildPreview(example.selection);

            return (
              <Card
                key={example.slug}
                className="group gap-3 py-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-primary/40"
              >
                <CardHeader className="px-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {tool && <ToolIcon icon={tool.icon} className="size-5" />}
                    </span>
                    <Badge variant="secondary" className="rounded-full">
                      {example.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-snug">
                    <Link
                      href={`/examples/${example.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {example.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col px-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {example.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileCode2 className="size-3.5" />
                    {preview.fileCount} files · {preview.dependencies.length} dependencies
                  </div>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    Browse the code
                    <ArrowRight className="size-4 opacity-50 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
