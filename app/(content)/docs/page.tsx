import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleHelp, Rocket } from "lucide-react";
import { CodeBlock } from "@/components/content/code-block";
import { PageHero } from "@/components/content/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { catalog } from "@/lib/setup/catalog";

export const metadata: Metadata = {
  title: "Documentation — AutoSetup",
  description:
    "How to generate a test automation framework with AutoSetup: the wizard, what the generated project contains, prerequisites, running tests and reports.",
};

const sections = [
  { id: "what-is-autosetup", label: "What is AutoSetup" },
  { id: "quick-start", label: "Quick start" },
  { id: "the-wizard", label: "The wizard, step by step" },
  { id: "whats-generated", label: "What you get" },
  { id: "structures", label: "Project structures" },
  { id: "prerequisites", label: "Prerequisites" },
  { id: "running", label: "Running your tests" },
  { id: "reports", label: "Reports" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

export default function DocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Documentation"
        title="Everything you need to run your first automated test"
        description="AutoSetup builds a ready-to-run automation project from your choices. This page explains each step, what lands in the ZIP and what to do with it."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-10 px-5">
            <Link href="/setup">
              Open the wizard <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10 px-5">
            <Link href="/guides">
              <BookOpen data-icon="inline-start" /> Read the guides
            </Link>
          </Button>
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              On this page
            </p>
            <ul className="space-y-1 border-l">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl space-y-14">
          <Section id="what-is-autosetup" title="What is AutoSetup">
            <p>
              AutoSetup is a generator for test automation projects. You answer four
              short questions — what you test, which language and framework, how the
              code should be organised, and which extras you want — and it produces a
              complete project as a ZIP.
            </p>
            <p>
              It exists because the hardest part of starting automation is rarely the
              testing. It is deciding which packages to install, where files should
              live, and how reporting is wired in. AutoSetup makes those decisions
              explicit and reversible.
            </p>
            <Callout>
              AutoSetup never installs anything on your machine and does not need an
              account. It generates files; you decide what to do with them.
            </Callout>
          </Section>

          <Section id="quick-start" title="Quick start">
            <ol className="ml-5 list-decimal space-y-3 marker:font-semibold marker:text-primary">
              <li>
                Open the <Link className="text-primary underline-offset-4 hover:underline" href="/setup">setup wizard</Link> and
                pick your tool, for example Selenium.
              </li>
              <li>Choose a language and test framework. Sensible defaults are pre-selected.</li>
              <li>Pick a project structure and any add-ons such as reporting.</li>
              <li>Review the file tree, then select <strong>Generate Project</strong> and download the ZIP.</li>
              <li>Unzip it and follow the Setup section of the README.</li>
            </ol>
            <CodeBlock
              label="A typical Python setup"
              code={`python -m venv .venv
.venv\\Scripts\\activate      # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
pytest`}
            />
          </Section>

          <Section id="the-wizard" title="The wizard, step by step">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  step: "01",
                  title: "Choose Tool",
                  body: "Pick the application type — web, mobile or API — then the automation tool. The tool you choose decides which languages are offered next.",
                },
                {
                  step: "02",
                  title: "Choose Stack",
                  body: "Language, test framework and browsers. Only valid combinations appear, so you cannot pick Cypress with Java.",
                },
                {
                  step: "03",
                  title: "Structure & Extras",
                  body: "How the code is organised, plus add-ons: reporting, screenshots, logging, CI workflow and Docker.",
                },
                {
                  step: "04",
                  title: "Review",
                  body: "Name your project and preview the exact file tree, dependencies, required software and commands before generating.",
                },
              ].map((item) => (
                <Card key={item.step} className="gap-2 py-5 shadow-xs">
                  <CardHeader className="px-5">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {item.step}
                    </span>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 text-sm text-muted-foreground">
                    {item.body}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="whats-generated" title="What you get">
            <p>Every generated project contains:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>Runnable sample tests</strong> — a login test and a test that
                picks an option from a dropdown, written against the public demo site
                saucedemo.com so they work before you change anything.
              </li>
              <li>
                <strong>A dependency manifest</strong> — <code>requirements.txt</code>,{" "}
                <code>package.json</code> or <code>pom.xml</code>, with versions pinned.
              </li>
              <li>
                <strong>Configuration</strong> — base URL, browser and timeouts kept out
                of the test files.
              </li>
              <li>
                <strong>A README</strong> — your stack, required software, setup
                commands, the run command and the report command.
              </li>
              <li>
                <strong>Add-on files</strong> — only for what you selected: a CI
                workflow, a Dockerfile, a logger, a screenshot helper.
              </li>
            </ul>
            <p className="text-muted-foreground">
              The generated code has no dependency on AutoSetup. It is an ordinary
              project you own and edit.
            </p>
          </Section>

          <Section id="structures" title="Project structures">
            <div className="space-y-4">
              {catalog.structures.map((structure) => (
                <Card key={structure.id} className="gap-2 py-5 shadow-xs">
                  <CardHeader className="px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{structure.name}</CardTitle>
                      <Badge variant="secondary" className="rounded-full">
                        {structure.level}
                      </Badge>
                      {structure.recommended && (
                        <Badge className="rounded-full bg-success/10 text-success">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-5">
                    <p className="text-sm text-muted-foreground">{structure.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {structure.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="rounded-md border bg-muted/60 px-2 py-1 text-xs text-muted-foreground"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p>
              Not sure which to choose? Read{" "}
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href="/guides/page-object-model"
              >
                Page Object Model, explained simply
              </Link>
              .
            </p>
          </Section>

          <Section id="prerequisites" title="Prerequisites">
            <p>
              AutoSetup generates files; the language runtime is yours to install. The
              review screen lists exactly what your chosen stack needs, and so does the
              project README.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-semibold">Language</th>
                    <th className="py-2 pr-4 font-semibold">You need</th>
                    <th className="py-2 font-semibold">Check with</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Python", "Python 3.10+ (pip included)", "python --version"],
                    ["Java", "JDK 17+ and Maven 3.9+", "java -version; mvn -v"],
                    ["TypeScript / JavaScript", "Node.js 20 LTS+", "node --version"],
                  ].map(([lang, need, check]) => (
                    <tr key={lang} className="border-b">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{lang}</td>
                      <td className="py-2.5 pr-4">{need}</td>
                      <td className="py-2.5 font-mono text-xs">{check}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground">
              Selenium drives browsers already installed on your machine. Playwright and
              Cypress download their own — Playwright needs one extra command,{" "}
              <code>npx playwright install</code>.
            </p>
          </Section>

          <Section id="running" title="Running your tests">
            <p>
              Each stack has a single command, shown on the review screen and repeated in
              the README.
            </p>
            <CodeBlock
              label="Run commands by stack"
              code={`pytest                        # Python + Pytest
behave                        # Python + Behave
mvn clean test                # Java (TestNG or JUnit)
npx playwright test           # Playwright (TypeScript / JavaScript)
npx cypress run               # Cypress
robot --outputdir reports tests   # Robot Framework`}
            />
            <Callout>
              Run the samples unchanged first. A green run proves your machine is set up
              correctly, which makes every later failure easier to diagnose.
            </Callout>
          </Section>

          <Section id="reports" title="Reports">
            <p>
              If you select a reporting add-on, the project is configured to produce a
              report and the review screen shows the command to open it.
            </p>
            <CodeBlock
              label="Opening a report"
              code={`allure serve reports/allure-results        # Allure
npx playwright show-report reports/html    # Playwright HTML
open reports/report.html                   # pytest-html or Robot`}
            />
            <p className="text-muted-foreground">
              Allure needs its own command line tool, separate from the Python or Node
              package. It is listed under Required software when you select it.
            </p>
          </Section>

          <Section id="troubleshooting" title="Troubleshooting">
            <dl className="space-y-5">
              {[
                {
                  q: "The tests cannot find my browser",
                  a: "Selenium uses the browsers installed on your machine. Install the browser you selected, or switch to Playwright or Cypress, which manage their own.",
                },
                {
                  q: "Playwright says no browsers are installed",
                  a: "Run npx playwright install (or playwright install for Python). This is the second setup step in the README.",
                },
                {
                  q: "allure: command not found",
                  a: "The allure-pytest package writes the results; the Allure command line tool renders them. Install the CLI separately.",
                },
                {
                  q: "The sample tests fail against saucedemo.com",
                  a: "Check your internet connection and any corporate proxy. The samples need to reach a public site.",
                },
                {
                  q: "Tests pass alone but fail together",
                  a: "Usually shared state between tests. Make each test create what it needs, and avoid depending on the order they run in.",
                },
              ].map((item) => (
                <div key={item.q}>
                  <dt className="font-medium">{item.q}</dt>
                  <dd className="mt-1 text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <CircleHelp className="size-5 text-primary" />
              <p className="text-muted-foreground">
                Still stuck? The{" "}
                <Link className="text-primary underline-offset-4 hover:underline" href="/faq">
                  FAQ
                </Link>{" "}
                covers the questions we hear most.
              </p>
            </div>
          </Section>

          <Card className="gap-3 border-primary/20 bg-primary/5 py-6 shadow-xs">
            <CardHeader className="px-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Rocket className="size-5" />
              </span>
              <CardTitle className="mt-2 text-lg">Ready to generate your project?</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <p className="text-muted-foreground">
                It takes about two minutes, and you can run it again any time with
                different choices.
              </p>
              <Button asChild size="lg" className="mt-4 h-10 px-5">
                <Link href="/setup">
                  Start now <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </article>
      </div>
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px]">
        {children}
      </div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-[15px]">
      {children}
    </div>
  );
}
