import React from 'react';
import { ResourceDetail, EvidenceCard } from '../types';
import { X, Trash2, Bookmark, ShieldCheck, MapPin } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white border-l border-warm-300 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-warm-200 bg-warm-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rosewood-700 border border-rose-200">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Saved Resources
              </h3>
              <p className="text-xs text-stone-500">Tracked for safety audits and updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {watchedResources.length === 0 ? (
            <div className="p-12 text-center text-stone-500 space-y-3 font-sans text-xs">
              <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mx-auto text-stone-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="font-semibold text-stone-700 text-sm">No saved resources yet</p>
              <p className="text-stone-500 max-w-xs mx-auto leading-relaxed">
                Click the bookmark icon on any hostel, hospital, or support centre card to keep it handy.
              </p>
            </div>
          ) : (
            watchedResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-3 relative group hover:border-brand-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{res.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">{res.locality || res.city}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveWatch(res.id)}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Remove from saved list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-warm-200/80 text-xs">
                  <FreshnessBadge level={res.freshness} observedAt={res.observed_at} />
                  {res.evidence_cards.length > 0 && (
                    <button
                      onClick={() => onSelectEvidence(res.evidence_cards[0])}
                      className="text-xs font-semibold text-rosewood-700 hover:underline flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>View Provenance</span>
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
