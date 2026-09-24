import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  FileCode2,
  Home,
  Wrench,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { NotFoundIllustration } from "@/components/not-found-illustration";
import { Button } from "@/components/ui/button";

// Note: not-found.tsx cannot export metadata (only global-not-found can),
// and Next.js adds <meta name="robots" content="noindex"> to 404s itself.

const destinations = [
  {
    href: "/setup",
    icon: Wrench,
    title: "Create a framework",
    description: "The wizard: tool, stack, structure, download.",
  },
  {
    href: "/docs",
    icon: BookOpen,
    title: "Documentation",
    description: "How it works and what you get.",
  },
  {
    href: "/examples",
    icon: FileCode2,
    title: "Examples",
    description: "Real generated projects, file by file.",
  },
  {
    href: "/faq",
    icon: CircleHelp,
    title: "FAQ",
    description: "The questions people ask most.",
  },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-16 text-center sm:px-6 sm:pt-10 sm:pb-24 lg:px-8">
          <p className="font-mono text-sm font-semibold tracking-wide text-destructive uppercase">
            Error 404
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            This test did not pass
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            We looked everywhere. This page does not exist — which makes it the
            one failure you do not have to debug.
          </p>

          <div className="mt-10 animate-fade-up">
            <NotFoundIllustration className="mx-auto w-full max-w-md" />
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 text-[15px]">
              <Link href="/">
                <Home data-icon="inline-start" /> Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 text-[15px]">
              <Link href="/setup">
                Create a framework <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="mt-14">
            <p className="text-sm font-semibold">Or try one of these</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {destinations.map(({ href, icon: Icon, title, description }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{title}</span>
                    <span className="block text-sm text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
