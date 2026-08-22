import React, { useEffect } from 'react';
import { LandingNav } from './components/LandingNav';
import { Hero } from './components/Hero';
import { TrustSection } from './components/TrustSection';
import { FeaturesBento } from './components/FeaturesBento';
import { ReliabilitySection } from './components/ReliabilitySection';
import { ProductPreview } from './components/ProductPreview';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { Reveal } from './components/Reveal';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-rose-200 selection:text-stone-900 text-stone-900">
      <LandingNav />
      <main className="overflow-hidden">
        <Hero />
        
        <Reveal>
          <TrustSection />
        </Reveal>
        
        <Reveal delay={100}>
          <ProductPreview />
        </Reveal>
        
        <Reveal delay={100}>
          <FeaturesBento />
        </Reveal>
        
        <Reveal delay={100}>
          <ReliabilitySection />
        </Reveal>
        
        <Reveal delay={100}>
          <FaqSection />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
};
