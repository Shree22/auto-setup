import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqCategories, faqs } from "@/lib/content/faqs";

export const metadata: Metadata = {
  title: "FAQ — AutoSetup",
  description:
    "Answers about AutoSetup: which tools are supported, choosing a stack, what the generated project contains, running tests and reading reports.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Everything people usually ask before and after generating their first framework."
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {faqCategories.map((category) => {
            const items = faqs.filter((faq) => faq.category === category);
            if (items.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="mb-4 text-sm font-semibold tracking-wide text-primary uppercase">
                  {category}
                </h2>
                <Accordion
                  type="single"
                  collapsible
                  className="rounded-2xl border bg-card px-5 shadow-xs sm:px-7"
                >
                  {items.map((faq) => (
                    <AccordionItem key={faq.question} value={faq.question}>
                      <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <h2 className="text-lg font-semibold">Still have a question?</h2>
          <p className="mt-1.5 text-muted-foreground">
            The documentation covers the wizard, the generated project and
            troubleshooting in more detail.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-10 px-5">
              <Link href="/docs">
                <BookOpen data-icon="inline-start" /> Read the documentation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-10 px-5">
              <Link href="/setup">
                Generate a project <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
