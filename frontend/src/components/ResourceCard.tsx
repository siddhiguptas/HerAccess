import React, { useState } from 'react';
import { ResourceDetail, EvidenceCard } from '../types';
import {
  MapPin, Bookmark, Layers, ExternalLink, Sparkles, ChevronDown, ChevronUp, AlertCircle, Check
} from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';
import { SupportChainView } from './SupportChainView';
import {
  HostelCardContent, HospitalCardContent, TransitCardContent,
  PharmacyCardContent, PoliceCardContent, WomenSupportCardContent
} from './CategoryCardContent';

interface Props {
  resource: ResourceDetail;
  onSelectEvidence: (evidence: EvidenceCard) => void;
  isWatched: boolean;
  onToggleWatch: (id: number) => void;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetail?: (resource: ResourceDetail) => void;
}

export const ResourceCard: React.FC<Props> = ({
  resource,
  onSelectEvidence,
  isWatched,
  onToggleWatch,
  isSelected,
  onSelect,
  onViewDetail
}) => {
  const [showSupportChain, setShowSupportChain] = useState(false);
  const [showWhyResult, setShowWhyResult] = useState(false);

  const ratingAttr = resource.attributes.find((a) => a.field_name === 'rating');

  const isSulekhaListing = resource.data_source_badge?.includes('Sulekha') ||
    resource.source_url?.includes('sulekha.com') ||
    resource.attributes.some((a) => a.field_name === 'directory_source');

  const categoryLabelMap: Record<string, string> = {
    women_hostel: 'Women Hostel',
    hospital: 'Government Hospital',
    public_transport: 'Metro Transit',
    pharmacy: '24x7 Chemist',
    police_or_public_support: 'Women Help Desk',
    women_support: 'Crisis Support & 1090'
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-white border-brand-700 shadow-lg shadow-brand-950/5 ring-1 ring-brand-700/40'
          : 'bg-white hover:bg-warm-50/50 border-warm-300/90 hover:border-warm-400 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-warm-200 text-stone-700">
                {categoryLabelMap[resource.category] || resource.category.replace(/_/g, ' ')}
              </span>

              {isSulekhaListing ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Verified Directory Listing
                </span>
              ) : resource.is_real_data ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Verified Primary Source
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-warm-100 text-stone-600 border border-warm-300">
                  Reference Safety Data
                </span>
              )}

              {ratingAttr?.normalized_value && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  ⭐ {Number(ratingAttr.normalized_value).toFixed(1)}
                </span>
              )}

              {resource.has_conflicts && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Audited Variance</span>
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-stone-900 tracking-tight leading-snug">
              {resource.name}
            </h3>

            <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>{resource.address || `${resource.locality}, ${resource.city}`}</span>
              {resource.distance_km !== undefined && (
                <span className="font-semibold text-stone-800">({resource.distance_km.toFixed(1)} km away)</span>
              )}
              {resource.source_url && (
                <a
                  href={resource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-brand-700 hover:text-brand-900 underline underline-offset-2 ml-1"
                >
                  <span>Official Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch(resource.id);
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              isWatched
                ? 'bg-rosewood-700 text-white border-rosewood-800 shadow-sm'
                : 'bg-warm-100 text-stone-500 hover:text-stone-900 border-warm-300 hover:bg-warm-200'
            }`}
            title={isWatched ? 'Saved in your watchlist' : 'Save this stay'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Category-Specific Data-Driven Presentation */}
        {resource.category === 'women_hostel' && (
          <HostelCardContent resource={resource} onSelectEvidence={onSelectEvidence} />
        )}
        {resource.category === 'hospital' && (
          <HospitalCardContent resource={resource} onSelectEvidence={onSelectEvidence} />
        )}
        {resource.category === 'public_transport' && (
          <TransitCardContent resource={resource} onSelectEvidence={onSelectEvidence} />
        )}
        {resource.category === 'pharmacy' && (
          <PharmacyCardContent resource={resource} onSelectEvidence={onSelectEvidence} />
        )}
        {resource.category === 'police_or_public_support' && (
          <PoliceCardContent resource={resource} onSelectEvidence={onSelectEvidence} />
        )}
        {resource.category === 'women_support' && (
          <WomenSupportCardContent resource={resource} onSelectEvidence={onSelectEvidence} />
        )}

        {/* Action Bar & Provenance */}
        <div className="flex items-center justify-between pt-3 border-t border-warm-200 text-xs flex-wrap gap-2">
          <FreshnessBadge level={resource.freshness} observedAt={resource.observed_at} />

          <div className="flex items-center gap-2">
            {onViewDetail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(resource);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-warm-100 hover:bg-warm-200 text-stone-800 border border-warm-300 transition-all shadow-2xs"
              >
                <span>View Dossier</span>
              </button>
            )}

            {resource.why_this_result.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWhyResult(!showWhyResult);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  showWhyResult
                    ? 'bg-rose-50 text-rosewood-700 border-rose-200 font-semibold'
                    : 'bg-white text-stone-600 border-warm-300 hover:bg-warm-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Why this match?</span>
                {showWhyResult ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {resource.support_chain.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSupportChain(!showSupportChain);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  showSupportChain
                    ? 'bg-sky-50 text-sky-900 border-sky-200 font-semibold'
                    : 'bg-white text-stone-600 border-warm-300 hover:bg-warm-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-700" />
                <span>Safety Mesh</span>
                {showSupportChain ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Expandable "Why This Result?" Factor Breakdown */}
        {showWhyResult && resource.why_this_result.length > 0 && (
          <div className="mt-3 p-4 rounded-xl bg-warm-50 border border-brand-200 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-rosewood-700">
              <span>Deterministic Requirement Matching</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 font-bold">
                {resource.match_score?.toFixed(0)}% Score
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {resource.why_this_result.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  {factor.matched ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-3.5 h-3.5 text-stone-400 shrink-0 text-center font-mono">—</span>
                  )}
                  <span className={factor.matched ? 'text-stone-800 font-medium' : 'text-stone-500'}>
                    {factor.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Support Chain Ecosystem */}
        {showSupportChain && resource.support_chain.length > 0 && (
          <div className="mt-3 animate-in fade-in duration-150">
            <SupportChainView chain={resource.support_chain} hostelName={resource.name} />
          </div>
        )}
      </div>
    </div>
  );
};
