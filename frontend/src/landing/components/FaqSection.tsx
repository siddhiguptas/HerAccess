import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

const FAQS = [
  {
    question: "How does HerAccess verify the safety of accommodations?",
    answer: "We don't rely on user reviews which can be faked. Our engine cross-references primary sources (like official websites) with verified public registries. We specifically extract and audit critical policies such as 'women-only' restrictions, curfew times, and security infrastructure to give you factual data."
  },
  {
    question: "Is the data in HerAccess real-time?",
    answer: "Yes. Using Bright Data's infrastructure, we run continuous scraping pipelines. If a hostel changes its admission policy or a hospital drops its 24x7 emergency status, our system detects the change and updates the database, flagging the discrepancy for transparency."
  },
  {
    question: "Does HerAccess guarantee my safety?",
    answer: "No platform can guarantee absolute safety. HerAccess provides verified public intelligence to help you make informed decisions. We give you the facts—like distance to the nearest police station, metro timings, and hospital emergency hours—so you can choose the environment that best fits your needs."
  },
  {
    question: "Why focus on women in new cities?",
    answer: "Relocating for education or work is a vulnerable transition. Standard search engines prioritize paid ads and SEO-optimized listings. HerAccess cuts through the noise, surfacing the specific safety, transit, and healthcare infrastructure women need when moving to an unfamiliar city."
  },
  {
    question: "How does the 'Self-Healing' scraper work?",
    answer: "When a target website changes its layout, traditional scrapers fail. Our system immediately detects schema breaks and uses Bright Data's AI-driven Web Scraper API to automatically adapt to the new layout, ensuring the flow of safety data is never interrupted."
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32 bg-warm-50 border-t border-warm-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-brand-700 text-xs font-semibold uppercase tracking-widest border border-rose-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Common Questions</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
            Clarity <span className="text-brand-700 italic font-normal">and</span> transparency.
          </h2>
          <p className="text-stone-600 font-sans max-w-2xl mx-auto text-sm sm:text-base">
            Everything you need to know about how HerAccess sources, verifies, and maintains our public safety network.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`group border rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                  isOpen 
                    ? 'bg-white border-brand-200 shadow-md shadow-brand-900/5' 
                    : 'bg-warm-100/50 border-warm-200 hover:bg-white hover:border-warm-300'
                }`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div className="flex items-center justify-between p-6 sm:p-8">
                  <h3 className={`font-bold text-base sm:text-lg transition-colors ${
                    isOpen ? 'text-brand-800' : 'text-stone-800 group-hover:text-brand-700'
                  }`}>
                    {faq.question}
                  </h3>
                  <div className={`p-2 rounded-full transition-transform duration-300 ${
                    isOpen ? 'bg-brand-50 text-brand-700 rotate-180' : 'bg-warm-200/50 text-stone-400 group-hover:bg-warm-200'
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                      <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
