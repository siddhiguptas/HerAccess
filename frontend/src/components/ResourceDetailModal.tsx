import React from 'react';
import { ResourceDetail, EvidenceCard } from '../types';
import {
  X, MapPin, Phone, ShieldCheck, Bed, UtensilsCrossed, FileText,
  Clock, ExternalLink, Bookmark, AlertCircle, Sparkles, Layers
} from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';
import { SupportChainView } from './SupportChainView';

interface Props {
  resource: ResourceDetail | null;
  onClose: () => void;
  onSelectEvidence: (ev: EvidenceCard) => void;
  isWatched: boolean;
  onToggleWatch: (id: number) => void;
}

export const ResourceDetailModal: React.FC<Props> = ({
  resource,
  onClose,
  onSelectEvidence,
  isWatched,
  onToggleWatch
}) => {
  if (!resource) return null;

  const priceAttr = resource.attributes.find((a) => a.field_name === 'monthly_price');
  const curfewAttr = resource.attributes.find((a) => a.field_name === 'curfew_time');
  const womenOnlyAttr = resource.attributes.find((a) => a.field_name === 'women_only');
  const facilitiesAttr = resource.attributes.find((a) => a.field_name === 'facilities');
  const roomTypesAttr = resource.attributes.find((a) => a.field_name === 'room_types');
  const mealAttr = resource.attributes.find((a) => a.field_name === 'meal_details');
  const policiesAttr = resource.attributes.find((a) => a.field_name === 'policies');
  const contactAttr = resource.attributes.find((a) => a.field_name === 'contact_numbers') || resource.primary_contact;

  const curfewDisplay = typeof curfewAttr?.normalized_value === 'object' && curfewAttr?.normalized_value !== null
    ? curfewAttr.normalized_value.raw || (curfewAttr.normalized_value.start && curfewAttr.normalized_value.end ? `${curfewAttr.normalized_value.start} - ${curfewAttr.normalized_value.end}` : 'Flexible')
    : curfewAttr?.normalized_value || curfewAttr?.raw_value || 'Flexible';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">{resource.name}</h2>
              {resource.is_real_data ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  REAL BRIGHT DATA DATA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  FIXTURE DATA
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{resource.address || `${resource.locality}, ${resource.city}`}</span>
              {resource.distance_km !== undefined && (
                <span className="font-mono text-slate-300 font-medium">({resource.distance_km.toFixed(1)} km away)</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatch(resource.id)}
              className={`p-2 rounded-xl border transition-all ${
                isWatched
                  ? 'bg-brand-500 text-white border-brand-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
              title={isWatched ? 'Watching' : 'Add to watchlist'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Verification & Source Level Banner */}
          {resource.data_source_badge?.includes('MULTI-SOURCE') ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono">CORROBORATED ACROSS MULTIPLE PUBLIC SOURCES</span>
                <span className="text-[11px] text-emerald-300/90 leading-relaxed">
                  Information for this hostel is verified across both direct provider domain and public directory listings.
                </span>
              </div>
            </div>
          ) : resource.data_source_badge?.includes('Sulekha') ? (
            <div className="p-3.5 rounded-xl bg-blue-950/70 border border-blue-500/40 text-xs text-blue-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono">PUBLIC DIRECTORY LISTING (SULEKHA)</span>
                <span className="text-[11px] text-blue-300/90 leading-relaxed">
                  Extracted from Sulekha public directory index (Verification Level: Medium). Factual fields reflect directory listing claims.
                </span>
              </div>
            </div>
          ) : resource.is_real_data ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono">DIRECT PRIMARY SOURCE (HIGH VERIFICATION)</span>
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  Extracted verbatim from official website with verifiable published policy quotes.
                </span>
              </div>
            </div>
          ) : null}

          {/* Key Facts Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Starting Rent</span>
              <span className="text-base font-bold text-emerald-400 font-mono block mt-0.5">
                {typeof priceAttr?.normalized_value === 'number'
                  ? `₹${priceAttr.normalized_value.toLocaleString()}/mo`
                  : priceAttr?.raw_value || 'Not listed'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Curfew / Gate</span>
              <span className="text-sm font-semibold text-white font-mono block mt-0.5">
                {String(curfewDisplay)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Reported Occupancy</span>
              <span className="text-sm font-semibold text-brand-300 block mt-0.5">
                {womenOnlyAttr?.normalized_value ? "Strictly Women's Only" : 'Co-ed / Shared'}
              </span>
            </div>
          </div>

          {/* Room-Level Pricing Tier Breakdown */}
          {roomTypesAttr?.normalized_value && Array.isArray(roomTypesAttr.normalized_value) && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-brand-300 uppercase tracking-wider font-semibold">
                <Bed className="w-4 h-4 text-brand-400" />
                <span>Published Room Configurations & Pricing</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roomTypesAttr.normalized_value.map((room: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-medium text-white block">{room.accommodation_type}</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono block">
                      ₹{room.monthly_rent?.value?.toLocaleString()}/mo
                    </span>
                    {room.room_features && (
                      <span className="text-[10px] text-slate-400 block font-mono">{room.room_features}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meal Details & House Policies */}
          <div className="space-y-4">
            {mealAttr?.normalized_value && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-wider font-semibold">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span>Meal & Fooding Policy</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {String(mealAttr.normalized_value)}
                </p>
              </div>
            )}

            {policiesAttr?.normalized_value && Array.isArray(policiesAttr.normalized_value) && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Published Hostel Rules & Policies</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 font-sans list-disc list-inside">
                  {policiesAttr.normalized_value.map((pol: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {pol}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Facilities & Amenities */}
          {facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold block">
                Verified Facilities & Infrastructure
              </span>
              <div className="flex flex-wrap gap-2">
                {facilitiesAttr.normalized_value.map((fac: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 font-mono capitalize"
                  >
                    {fac.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Published Contact Numbers
              </span>
              <span className="text-xs font-mono text-white font-medium mt-0.5 block">
                {resource.primary_contact || 'Inquire at source'}
              </span>
            </div>
            {resource.source_url && (
              <a
                href={resource.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Evidence Cards Attached */}
          {resource.evidence_cards.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Attached Evidence Quotes ({resource.evidence_cards.length})
              </span>
              <div className="space-y-2">
                {resource.evidence_cards.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectEvidence(ev)}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-brand-300 font-medium capitalize">{ev.field_name.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400">Click to view provenance</span>
                    </div>
                    <p className="text-xs text-slate-300 italic font-sans">"{ev.evidence_quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Chain Mesh */}
          {resource.support_chain.length > 0 && (
            <SupportChainView chain={resource.support_chain} hostelName={resource.name} />
          )}
        </div>
      </div>
    </div>
  );
};
