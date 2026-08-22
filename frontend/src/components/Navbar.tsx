import React from 'react';
import { Bookmark, Shield, MapPin, Layers, History, Activity, Sparkles, Scale } from 'lucide-react';

export type NavTab = 'navigator' | 'conflicts' | 'changes' | 'health';

interface Props {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  watchlistCount: number;
  onOpenWatchlist: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  onOpenWatchlist
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-warm-300/80 bg-warm-100/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => setActiveTab('navigator')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 group-hover:scale-105 transition-transform flex-shrink-0">
            <img src="/logo.svg" alt="HerAccess Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-2xl text-stone-900 tracking-tight">
                Her<span className="text-brand-700 italic font-normal">Access</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-rose-50 text-brand-800 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Verified Safety Network
              </span>
            </div>
            <p className="text-xs text-stone-500 font-sans hidden sm:block">
              Curated verified public resources for women in new cities
            </p>
          </div>
        </div>

        {/* Center Editorial Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-warm-200/80 p-1.5 rounded-2xl border border-warm-300/70 text-xs font-medium text-stone-600 shadow-inner">
          <button
            onClick={() => setActiveTab('navigator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'navigator'
                ? 'bg-rosewood-700 text-white shadow-sm font-semibold'
                : 'hover:text-stone-900 hover:bg-warm-100/80'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Explore & Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'conflicts'
                ? 'bg-rosewood-700 text-white shadow-sm font-semibold'
                : 'hover:text-stone-900 hover:bg-warm-100/80'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Fact Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('changes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'changes'
                ? 'bg-rosewood-700 text-white shadow-sm font-semibold'
                : 'hover:text-stone-900 hover:bg-warm-100/80'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Live Changes</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'health'
                ? 'bg-rosewood-700 text-white shadow-sm font-semibold'
                : 'hover:text-stone-900 hover:bg-warm-100/80'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Data Transparency</span>
          </button>
        </nav>

        {/* Right Area: City & Watchlist */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm-200/60 border border-warm-300/60 text-xs font-medium text-stone-600">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Lucknow, Uttar Pradesh</span>
          </div>

          <button
            onClick={onOpenWatchlist}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-warm-50 border border-warm-300 text-xs font-semibold text-stone-800 shadow-sm hover:shadow transition-all"
          >
            <Bookmark className="w-4 h-4 text-brand-600" />
            <span>Saved Stays</span>
            {watchlistCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-700 text-white text-[10px] font-bold">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

