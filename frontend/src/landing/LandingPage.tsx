import React, { useEffect } from 'react';
import { LandingNav } from './components/LandingNav';
import { Hero } from './components/Hero';
import { TrustSection } from './components/TrustSection';
import { HowItWorks } from './components/HowItWorks';
import { ReliabilitySection } from './components/ReliabilitySection';
import { ProductPreview } from './components/ProductPreview';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  // Ensure the page always starts at the top when navigating
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans selection:bg-rose-200 selection:text-stone-900 text-stone-900">
      <LandingNav />
      <main>
        <Hero />
        <TrustSection />
        <HowItWorks />
        <ReliabilitySection />
        <ProductPreview />
      </main>
      <Footer />
    </div>
  );
};
