import React, { useState } from 'react';
import { Search, Sparkles, MapPin, IndianRupee, ArrowRight, Compass } from 'lucide-react';

interface Props {
  onSearch: (query: string, city: string, budget?: number, locality?: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUERIES = [
  "I'm a female student moving to Lucknow for college. I need a women's hostel under ₹12,000 with public transport and healthcare nearby.",
  "Working woman relocating to Gomti Nagar Lucknow. Looking for women's PG with late curfew, 24x7 pharmacy, and metro access.",
  "Student near Lucknow University New Campus in Jankipuram. Need safe budget hostel under ₹8,000 with meals included."
];

export const SearchHero: React.FC<Props> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0]);
  const [city, setCity] = useState('Lucknow');
  const [budget, setBudget] = useState<number | undefined>(12000);
  const [locality, setLocality] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, city, budget, locality || undefined);
    }
  };

  return (
    <div className="relative isolate overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
      {/* Decorative subtle gradient */}
      <div
        className="absolute -top-32 -left-32 -z-10 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 -z-10 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
            <Compass className="w-3.5 h-3.5 animate-spin text-brand-400" style={{ animationDuration: '8s' }} />
            <span>City-scale live safety intelligence architecture, designed to expand nationwide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Discover verified public resources in your new city.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            We extract and verify public accommodation, transport schedules, 24x7 hospitals, pharmacies, and women's support centers from fragmented long-tail sources using Bright Data.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your situation and what you need (e.g. female student moving to Lucknow looking for hostel under ₹12k with nearby hospital)..."
              rows={3}
              className="w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 p-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white shadow-lg shadow-brand-950/50 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="text-slate-400">City:</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full font-medium"
              />
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Max Budget:</span>
              <input
                type="number"
                value={budget || ''}
                onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="₹12,000"
                className="bg-transparent text-slate-200 focus:outline-none w-full font-mono font-medium"
              />
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-slate-400">Locality:</span>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Hazratganj / Gomti Nagar"
                className="bg-transparent text-slate-200 focus:outline-none w-full font-medium"
              />
            </div>
          </div>

          {/* Sample Prompts */}
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              💡 Sample Real-World Situations
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(sample)}
                  className="text-left text-xs px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-slate-300 transition-colors"
                >
                  <span className="text-brand-400 mr-1.5 font-bold">#{idx + 1}</span>
                  {sample.slice(0, 55)}...
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
