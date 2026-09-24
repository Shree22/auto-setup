import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section id="get-started" className="scroll-mt-16 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-xl shadow-primary/20 sm:px-12 sm:py-20">
          {/* Quiet decorative rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border border-white/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full border border-white/10"
          />

          <h2 className="relative text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready to Start Automation?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base text-pretty text-primary-foreground/85 sm:text-lg">
            Stop spending hours setting up your framework. Start building
            automation instead.
          </p>

          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 bg-white px-6 text-[15px] text-primary hover:bg-white/90"
            >
              <Link href="/setup">
                Create Your First Framework <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-white/30 bg-transparent px-6 text-[15px] text-primary-foreground hover:bg-white/10 hover:text-primary-foreground dark:border-white/30 dark:bg-transparent dark:hover:bg-white/10"
            >
              <Link href="/docs">
                <BookOpen data-icon="inline-start" /> View Documentation
              </Link>
            </Button>
          </div>

          <p className="relative mt-6 text-sm text-primary-foreground/75">
            No complicated setup. No unnecessary configuration.
          </p>
        </div>
      </div>
    </section>
  );
}
