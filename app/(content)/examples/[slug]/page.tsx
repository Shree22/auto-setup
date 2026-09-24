import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Download, Package, Terminal } from "lucide-react";
import { CodeBlock } from "@/components/content/code-block";
import { FileBrowser } from "@/components/content/file-browser";
import { PageHero } from "@/components/content/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { examples, getExample } from "@/lib/content/examples";
import { generateProjectFiles } from "@/lib/setup/generate";
import { buildPreview } from "@/lib/setup/preview";
import { encodeSelection } from "@/lib/setup/token";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { clampDescription, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return examples.map((example) => ({ slug: example.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/examples/[slug]">): Promise<Metadata> {
  const example = getExample((await params).slug);
  if (!example) return { title: "Example not found" };

  return pageMetadata({
    title: `${example.title} example`,
    description: clampDescription(
      `${example.description} Browse the generated project file by file.`
    ),
    path: `/examples/${example.slug}`,
  });
}

export default async function ExamplePage({ params }: PageProps<"/examples/[slug]">) {
  const example = getExample((await params).slug);
  if (!example) notFound();

  const preview = buildPreview(example.selection);
  const generated = generateProjectFiles(example.selection);

  // Featured files first, then everything else, so the interesting code is on top.
  const files = [
    ...example.featuredFiles
      .map((path) => generated.find((file) => file.path === path))
      .filter((file): file is (typeof generated)[number] => Boolean(file)),
    ...generated.filter((file) => !example.featuredFiles.includes(file.path)),
  ];

  const { toolId, languageId, frameworkId, structureId } = example.selection;
  const setupHref = `/setup?tool=${toolId}&language=${languageId}&framework=${frameworkId}&structure=${structureId}`;
  const downloadHref = `/api/projects/download?token=${encodeSelection(example.selection)}&from=examples`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Examples", path: "/examples" },
          { name: example.title, path: `/examples/${example.slug}` },
        ])}
      />
      <PageHero
        title={example.title}
        description={example.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Examples", href: "/examples" },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-10 px-5">
            <Link href={setupHref}>
              Open this setup <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10 px-5">
            <a href={downloadHref} download={`${example.selection.projectName}.zip`}>
              <Download data-icon="inline-start" /> Download ZIP
            </a>
          </Button>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <p className="text-sm font-semibold">What this shows</p>
            <ul className="mt-3 space-y-2">
              {example.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={3} />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Package className="size-4 text-primary" /> Dependencies
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {preview.dependencies.map((dep) => (
                <span
                  key={dep}
                  className="rounded-md border bg-muted/60 px-2 py-1 font-mono text-xs text-muted-foreground"
                >
                  {dep}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {preview.fileCount} files generated
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Terminal className="size-4 text-primary" /> Commands
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Run the tests</p>
                <code className="block truncate rounded-md border bg-muted/60 px-2 py-1.5 font-mono text-xs">
                  {preview.runCommand}
                </code>
              </div>
              {preview.reportCommand && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Open the report</p>
                  <code className="block truncate rounded-md border bg-muted/60 px-2 py-1.5 font-mono text-xs">
                    {preview.reportCommand}
                  </code>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Browse the project</h2>
            <Badge variant="secondary" className="rounded-full">
              {files.length} files
            </Badge>
          </div>
          <FileBrowser files={files} />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Getting it running</h2>
          <CodeBlock
            label="Setup"
            code={[
              ...preview.setupSteps.map((step) => `# ${step.label}\n${step.command}`),
              `# Run the tests\n${preview.runCommand}`,
            ].join("\n\n")}
          />
        </section>
      </div>
    </>
  );
}
