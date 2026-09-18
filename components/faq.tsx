import { SectionHeading } from "@/components/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is AutoSetup only for beginners?",
    answer:
      "AutoSetup is designed to make framework setup easier for beginners while also providing structured starting points for experienced testers.",
  },
  {
    question: "Which automation tools will be supported?",
    answer:
      "The platform is designed to support popular tools such as Selenium, Playwright, Cypress, Robot Framework, Appium and API testing tools.",
  },
  {
    question: "Can I choose Python or Java?",
    answer:
      "Yes. The platform can provide different automation stacks based on your selected language and framework.",
  },
  {
    question: "Do I need to know automation before using AutoSetup?",
    answer:
      "No. The interface is designed to explain the available choices and help manual testers understand the setup.",
  },
  {
    question: "Will AutoSetup install software on my computer?",
    answer:
      "The product is designed to generate project configurations and setup files. Actual machine-level software installation can be handled separately.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 pb-20 sm:pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />

        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="mt-10 rounded-2xl border bg-card px-5 shadow-xs sm:px-7"
        >
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
