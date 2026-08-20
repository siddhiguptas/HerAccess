import React from 'react';
import { Compass, Activity, Bookmark, History, Scale, Sparkles } from 'lucide-react';

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
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setActiveTab('navigator')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-500 to-rose-400 p-0.5 shadow-lg shadow-brand-950/50 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">HerAccess</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                REAL BRIGHT DATA DATA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">7 Real Bright Data Collectors (Live) + Reference Ecosystem</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('navigator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'navigator'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-950/60 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Navigator</span>
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'conflicts'
                ? 'bg-amber-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Conflicts</span>
          </button>

          <button
            onClick={() => setActiveTab('changes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'changes'
                ? 'bg-sky-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Changes Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'health'
                ? 'bg-brand-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health Center</span>
          </button>
        </nav>

        {/* Watchlist & Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenWatchlist}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-brand-400" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
