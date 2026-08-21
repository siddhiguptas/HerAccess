import React, { useState } from 'react';
import { Search, MapPin, IndianRupee, ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { ParsedIntent } from '../types';

interface Props {
  onSearch: (query: string, city: string, budget?: number, locality?: string) => void;
  isLoading: boolean;
  currentIntent?: ParsedIntent | null;
}

const SAMPLE_QUERIES = [
  "Student near Bhoothnath market in Lucknow. Need safe budget hostel under ₹8,000 with meals included.",
  "Working woman relocating to Gomti Nagar Lucknow. Looking for women's PG with late curfew, 24x7 pharmacy, and metro access.",
  "Women's hostel near Lucknow University New Campus in Jankipuram with healthcare nearby."
];

export const SearchHero: React.FC<Props> = ({ onSearch, isLoading, currentIntent }) => {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0]);
  const [city, setCity] = useState('Lucknow');
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [locality, setLocality] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, city, budget, locality.trim() ? locality.trim() : undefined);
    }
  };

  const handleSelectSample = (sample: string) => {
    setQuery(sample);
    setBudget(undefined);
    setLocality('');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-warm-200/90 via-warm-100 to-warm-200/60 border border-warm-300/80 p-6 sm:p-10 lg:p-12 shadow-sm transition-all">
      {/* Editorial Decorative Background Elements */}
      <div
        className="absolute -top-24 -right-24 -z-10 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 -z-10 w-80 h-80 rounded-full bg-amber-100/50 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex flex-col lg:flex-row items-center gap-8 max-w-5xl mx-auto">
        {/* Right side image — left edge fades into background, full figure visible */}
        <div
          className="flex-1 flex justify-center lg:justify-end order-last lg:order-last"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 18%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%)',
          }}
        >
          <img
            src="/hero-girl.png"
            alt="Girl illustration"
            className="w-full max-w-sm h-auto object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
        {/* Right side content */}
        <div className="flex-1 space-y-6 order-first lg:order-first">
          <div className="max-w-3xl space-y-6">
            {/* Editorial Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-warm-300 text-stone-700 text-xs font-medium shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
              <span>Verified safety intelligence for women moving to new cities</span>
            </div>

            {/* Hero Title */}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-[1.15]">
                Find a safer place to live. <br />
                <span className="text-rosewood-700 italic font-normal">Find the support around you.</span>
              </h1>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl font-sans">
                We extract and verify public women's accommodations, transit timings, 24x7 hospitals, chemists, and emergency helplines directly from primary public sources.
              </p>
            </div>

            {/* Human-Centered Natural Search Input */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="relative bg-white rounded-2xl border border-warm-300 shadow-md shadow-stone-200/40 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-rose-100 transition-all overflow-hidden p-2 sm:p-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe your situation (e.g. female student moving to Lucknow looking for hostel under ₹8k with nearby hospital)..."
                  rows={2}
                  className="w-full bg-transparent px-3 py-2 text-stone-800 placeholder-stone-400 text-sm sm:text-base focus:outline-none resize-none font-sans leading-relaxed"
                />
                <div className="flex items-center justify-between pt-2 border-t border-warm-200 px-2 flex-wrap gap-2">
                  <span className="text-[11px] text-stone-500 font-medium">
                    Type naturally in English or Hinglish
                  </span>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all"
                  >
                    <span>{isLoading ? 'Verifying resources...' : 'Search Lucknow Safety'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Criteria Refinement Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 border border-warm-300 shadow-2xs">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-stone-500 font-medium">City:</span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent text-stone-800 focus:outline-none w-full font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 border border-warm-300 shadow-2xs">
                  <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-stone-500 font-medium">Budget:</span>
                  <input
                    type="number"
                    value={budget !== undefined ? budget : (currentIntent?.budget_max || '')}
                    onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={currentIntent?.budget_max ? `₹${currentIntent.budget_max.toLocaleString()}` : "Auto from text"}
                    className="bg-transparent text-stone-800 focus:outline-none w-full font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 border border-warm-300 shadow-2xs">
                  <Compass className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-stone-500 font-medium">Locality:</span>
                  <input
                    type="text"
                    value={locality || (currentIntent?.target_location || '')}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder={currentIntent?.target_location || "Auto from query"}
                    className="bg-transparent text-stone-800 focus:outline-none w-full font-semibold truncate"
                  />
                </div>
              </div>

              {/* Understated Editorial Situation Chips */}
              <div className="pt-2 space-y-2">
                <span className="text-xs font-semibold text-stone-600 block">
                  Real-world situations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_QUERIES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="text-left text-xs px-3.5 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-warm-300 text-stone-700 hover:text-stone-900 transition-all shadow-2xs"
                    >
                      <span className="text-brand-700 font-bold mr-1.5">{idx === 0 ? '🎓' : idx === 1 ? '💼' : '🏛️'}</span>
                      {sample.slice(0, 52)}...
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
