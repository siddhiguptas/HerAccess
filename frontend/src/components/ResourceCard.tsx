import React, { useState } from 'react';
import { ResourceDetail, EvidenceCard } from '../types';
import {
  MapPin, Phone, ShieldCheck, Check, Info, Bookmark,
  Layers, ExternalLink, Sparkles, ChevronDown, ChevronUp, AlertCircle,
  Bed, UtensilsCrossed, FileText
} from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';
import { SupportChainView } from './SupportChainView';

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

  // Extract key normalized attributes
  const priceAttr = resource.attributes.find((a) => a.field_name === 'monthly_price');
  const curfewAttr = resource.attributes.find((a) => a.field_name === 'curfew_time');
  const womenOnlyAttr = resource.attributes.find((a) => a.field_name === 'women_only');
  const facilitiesAttr = resource.attributes.find((a) => a.field_name === 'facilities');
  const roomTypesAttr = resource.attributes.find((a) => a.field_name === 'room_types');
  const mealAttr = resource.attributes.find((a) => a.field_name === 'meal_details');
  const policiesAttr = resource.attributes.find((a) => a.field_name === 'policies');
  const ratingAttr = resource.attributes.find((a) => a.field_name === 'rating');

  const isSulekhaListing = resource.data_source_badge?.includes('Sulekha') ||
    resource.source_url?.includes('sulekha.com') ||
    resource.attributes.some((a) => a.field_name === 'directory_source');

  const curfewDisplay = typeof curfewAttr?.normalized_value === 'object' && curfewAttr?.normalized_value !== null
    ? curfewAttr.normalized_value.raw || (curfewAttr.normalized_value.start && curfewAttr.normalized_value.end ? `${curfewAttr.normalized_value.start} - ${curfewAttr.normalized_value.end}` : 'Flexible')
    : curfewAttr?.normalized_value || curfewAttr?.raw_value || 'Flexible';

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-slate-900 border-brand-500 shadow-xl shadow-brand-950/40 ring-1 ring-brand-500/50'
          : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Card Top Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white tracking-tight">{resource.name}</h3>
              {isSulekhaListing ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-500/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  SULEKHA LISTING
                </span>
              ) : resource.is_real_data ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  REAL BRIGHT DATA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  FIXTURE DATA
                </span>
              )}
              {ratingAttr?.normalized_value && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-600/40">
                  ⭐ {Number(ratingAttr.normalized_value).toFixed(1)}/5.0
                </span>
              )}
              {resource.has_conflicts && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60">
                  <AlertCircle className="w-3 h-3" />
                  <span>Conflicting Facts</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">{resource.address || `${resource.locality}, ${resource.city}`}</span>
              {resource.distance_km !== undefined && (
                <span className="font-mono text-slate-300 font-medium">({resource.distance_km.toFixed(1)} km)</span>
              )}
              {resource.source_url && (
                <a
                  href={resource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-400 hover:text-brand-300 ml-1 underline decoration-brand-500/40 underline-offset-2"
                >
                  <span>{isSulekhaListing ? 'Sulekha page' : 'Source'}</span>
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
            className={`p-2 rounded-xl border transition-all ${
              isWatched
                ? 'bg-brand-500 text-white border-brand-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-800'
            }`}
            title={isWatched ? 'Watching for changes' : 'Watch this resource'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Attribute Badges with Evidence Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Price */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'monthly_price');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-brand-500/40 transition-colors group"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Starting Rent</span>
            <span className="text-sm font-semibold text-emerald-400 font-mono block mt-0.5">
              {typeof priceAttr?.normalized_value === 'number'
                ? `₹${priceAttr.normalized_value.toLocaleString()}/mo`
                : priceAttr?.raw_value || 'Not listed'}
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-brand-300 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-brand-400" /> Evidence
            </span>
          </div>

          {/* Curfew */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'curfew_time');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-brand-500/40 transition-colors group"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Curfew / Gate</span>
            <span className="text-sm font-semibold text-white font-mono block mt-0.5 truncate" title={String(curfewDisplay)}>
              {String(curfewDisplay)}
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-brand-300 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-brand-400" /> Evidence
            </span>
          </div>

          {/* Occupancy */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'women_only');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-brand-500/40 transition-colors group col-span-2 sm:col-span-1"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Reported Occupancy</span>
            <span className="text-sm font-semibold text-brand-300 block mt-0.5">
              {womenOnlyAttr?.normalized_value ? "Women's Only" : 'Co-ed / Shared'}
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-brand-300 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-brand-400" /> Evidence
            </span>
          </div>
        </div>

        {/* Room Types Breakdown (if available) */}
        {roomTypesAttr?.normalized_value && Array.isArray(roomTypesAttr.normalized_value) && (
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-brand-400" />
              <span>Verified Room Configurations</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {roomTypesAttr.normalized_value.map((room: any, rIdx: number) => (
                <div key={rIdx} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-300 font-medium">{room.accommodation_type}: </span>
                  <span className="text-emerald-400 font-bold">
                    ₹{room.monthly_rent?.value?.toLocaleString()}/mo
                  </span>
                  {room.room_features && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">{room.room_features}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meal Details & Policy Badges */}
        {(mealAttr?.normalized_value || policiesAttr?.normalized_value) && (
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {mealAttr?.normalized_value && (
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-amber-800/40 text-amber-300 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                <span>{String(mealAttr.normalized_value)}</span>
              </span>
            )}
            {policiesAttr?.normalized_value && Array.isArray(policiesAttr.normalized_value) && (
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-indigo-800/40 text-indigo-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{policiesAttr.normalized_value.length} House Policies Verified</span>
              </span>
            )}
          </div>
        )}

        {/* Facilities tags */}
        {facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {facilitiesAttr.normalized_value.slice(0, 4).map((fac: string, idx: number) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono capitalize"
              >
                {fac.replace(/_/g, ' ')}
              </span>
            ))}
            {facilitiesAttr.normalized_value.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{facilitiesAttr.normalized_value.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Action Bar (Why this result toggle, Support Chain toggle, Source Freshness) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
          <FreshnessBadge level={resource.freshness} observedAt={resource.observed_at} />

          <div className="flex items-center gap-2">
            {onViewDetail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(resource);
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
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
                className={`px-2.5 py-1 rounded-lg font-mono text-xs flex items-center gap-1.5 border transition-all ${
                  showWhyResult
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>Why This Result?</span>
                {showWhyResult ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {resource.support_chain.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSupportChain(!showSupportChain);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs flex items-center gap-1.5 border transition-all ${
                  showSupportChain
                    ? 'bg-sky-950 text-sky-300 border-sky-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3 text-sky-400" />
                <span>Support Chain</span>
                {showSupportChain ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Expandable "Why This Result?" Factor Breakdown */}
        {showWhyResult && resource.why_this_result.length > 0 && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950/90 border border-brand-500/20 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono text-brand-300">
              <span className="uppercase font-semibold">Deterministic Matching Breakdown</span>
              <span className="px-2 py-0.5 rounded bg-brand-500/20 font-bold">
                {resource.match_score?.toFixed(0)}% Match
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {resource.why_this_result.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  {factor.matched ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-3.5 h-3.5 text-slate-500 shrink-0 font-mono text-center">—</span>
                  )}
                  <span className={factor.matched ? 'text-slate-200' : 'text-slate-400'}>{factor.label}</span>
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
