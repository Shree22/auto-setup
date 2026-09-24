import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Lightbulb } from "lucide-react";
import { CodeBlock } from "@/components/content/code-block";
import { PageHero } from "@/components/content/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getGuide, guides } from "@/lib/content/guides";
import { JsonLd, articleSchema, breadcrumbSchema } from "@/components/seo/json-ld";
import { clampDescription, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return { title: "Guide not found" };

  return pageMetadata({
    title: guide.title,
    description: clampDescription(
      `${guide.description} A ${guide.minutes}-minute guide for manual testers moving into automation.`
    ),
    path: `/guides/${guide.slug}`,
    type: "article",
  });
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const others = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: guide.title,
          description: guide.description,
          path: `/guides/${guide.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ])}
      />
      <PageHero
        title={guide.title}
        description={guide.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="rounded-full">
            {guide.level}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" /> {guide.minutes} min read
          </span>
        </div>
      </PageHero>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <article className="space-y-12">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {section.heading}
              </h2>

              <div className="mt-4 space-y-4 text-[15px] leading-relaxed">
                {section.body?.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}

                {section.list && (
                  <ul className="ml-5 list-disc space-y-2 text-muted-foreground">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.steps && (
                  <ol className="ml-5 list-decimal space-y-2 text-muted-foreground marker:font-semibold marker:text-primary">
                    {section.steps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                )}

                {section.code && (
                  <CodeBlock
                    code={section.code.code}
                    label={section.code.label}
                    language={section.code.language}
                  />
                )}

                {section.callout && (
                  <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p>{section.callout}</p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </article>

        {guide.setupHref && (
          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-lg font-semibold">Try it for yourself</h2>
            <p className="mt-1.5 text-muted-foreground">
              Generate a project with these choices already applied and read the
              generated code.
            </p>
            <Button asChild size="lg" className="mt-4 h-10 px-5">
              <Link href={guide.setupHref}>
                Open the wizard <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        )}

        <Separator className="my-12" />

        <h2 className="text-lg font-semibold">Keep reading</h2>
        <ul className="mt-4 space-y-3">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/guides/${other.slug}`}
                className="group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{other.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {other.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
