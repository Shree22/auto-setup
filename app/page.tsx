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
import { JsonLd, softwareApplicationSchema } from "@/components/seo/json-ld";
import { siteDescription } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={softwareApplicationSchema(siteDescription)} />
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
