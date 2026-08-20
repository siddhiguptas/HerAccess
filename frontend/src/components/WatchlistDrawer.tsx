import React from 'react';
import { ResourceDetail, EvidenceCard } from '../types';
import { X, Trash2, ArrowRight, Bookmark, ShieldCheck, MapPin } from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  watchedResources: ResourceDetail[];
  onRemoveWatch: (id: number) => void;
  onSelectEvidence: (ev: EvidenceCard) => void;
}

export const WatchlistDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  watchedResources,
  onRemoveWatch,
  onSelectEvidence
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Monitored Watchlist
              </h3>
              <p className="text-xs text-slate-400">Continuous monitoring via Bright Data collectors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {watchedResources.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3 font-mono text-xs">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <p>You have not bookmarked any hostels or public resources yet.</p>
              <p className="text-[11px] text-slate-500">
                Click the bookmark icon on any card to monitor changes in price, curfews, and transit.
              </p>
            </div>
          ) : (
            watchedResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{res.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                      <span className="truncate">{res.locality || res.city}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveWatch(res.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <FreshnessBadge level={res.freshness} observedAt={res.observed_at} />
                  {res.evidence_cards.length > 0 && (
                    <button
                      onClick={() => onSelectEvidence(res.evidence_cards[0])}
                      className="text-[11px] text-brand-300 hover:underline flex items-center gap-1 font-mono"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>View Evidence</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
