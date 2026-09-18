import { CtaSection } from "@/components/cta-section";
import { Faq } from "@/components/faq";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Navbar } from "@/components/navbar";
import { PopularStacks } from "@/components/popular-stacks";
import { ProblemSection } from "@/components/problem-section";
import { ProductPreview } from "@/components/product-preview";
import { SupportedTools } from "@/components/supported-tools";
import { ValueStrip } from "@/components/value-strip";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ValueStrip />
        <ProblemSection />
        <HowItWorks />
        <SupportedTools />
        <PopularStacks />
        <FeaturesSection />
        <ProductPreview />
        <CtaSection />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
