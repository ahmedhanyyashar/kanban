import { SkipLink } from "@repo/ui/blocks/skip-link";

import { AISpotlight } from "@/features/landing/components/ai-spotlight";
import { Features } from "@/features/landing/components/features";
import { FinalCTA } from "@/features/landing/components/final-cta";
import { Footer } from "@/features/landing/components/footer";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Navbar } from "@/features/landing/components/navbar";

export const LandingPage = () => (
  <div id="top" className="min-h-screen overflow-x-clip bg-background">
    <SkipLink />
    <Navbar />
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <Features />
      <HowItWorks />
      <AISpotlight />
      <FinalCTA />
    </main>
    <Footer />
  </div>
);
