import React from 'react';
import { ResourceDetail, EvidenceCard } from '../types';
import {
  X, MapPin, Phone, ShieldCheck, Bed, UtensilsCrossed, FileText,
  Clock, ExternalLink, Bookmark, AlertCircle, Sparkles, Layers,
  Stethoscope, Train, Pill, Shield, HeartHandshake, IndianRupee
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

  const curfewDisplay = typeof curfewAttr?.normalized_value === 'object' && curfewAttr?.normalized_value !== null
    ? curfewAttr.normalized_value.raw || (curfewAttr.normalized_value.start && curfewAttr.normalized_value.end ? `${curfewAttr.normalized_value.start} - ${curfewAttr.normalized_value.end}` : null)
    : curfewAttr?.normalized_value || curfewAttr?.raw_value || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-warm-300 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 sm:p-7 border-b border-warm-200 bg-warm-50/70">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-warm-200 text-stone-700">
                {resource.category.replace(/_/g, ' ')}
              </span>
              {resource.is_real_data ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Verified Primary Source
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-warm-100 text-stone-600 border border-warm-200">
                  Reference Data
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-snug">
              {resource.name}
            </h2>

            <div className="flex items-center gap-2 text-xs text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>{resource.address || `${resource.locality}, ${resource.city}`}</span>
              {resource.distance_km !== undefined && (
                <span className="font-semibold text-stone-800">({resource.distance_km.toFixed(1)} km away)</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatch(resource.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isWatched
                  ? 'bg-rosewood-700 text-white border-rosewood-800 shadow-sm'
                  : 'bg-white text-stone-500 hover:text-stone-900 border-warm-300 hover:bg-warm-50'
              }`}
              title={isWatched ? 'Saved in watchlist' : 'Save this resource'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-warm-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* Verification & Source Level Banner */}
          {resource.data_source_badge?.includes('MULTI-SOURCE') ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Corroborated Across Multiple Public Sources</span>
                <span className="text-stone-600 leading-relaxed mt-0.5 block">
                  Information for this listing is cross-referenced between official domain publications and verified directory registries.
                </span>
              </div>
            </div>
          ) : resource.data_source_badge?.includes('Sulekha') ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Verified Directory Registry Listing</span>
                <span className="text-stone-600 leading-relaxed mt-0.5 block">
                  Extracted from Sulekha public directory index. Factual fields reflect verified directory listing attributes.
                </span>
              </div>
            </div>
          ) : resource.is_real_data ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Direct Primary Source (High Verification)</span>
                <span className="text-stone-600 leading-relaxed mt-0.5 block">
                  Extracted verbatim from official website with verifiable published policy quotes.
                </span>
              </div>
            </div>
          ) : null}

          {/* Category-Specific Facts & Infrastructure */}
          {resource.category === 'women_hostel' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {priceAttr && (
                  <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Starting Rent</span>
                    <span className="text-lg font-bold text-emerald-700 block mt-0.5">
                      {typeof priceAttr.normalized_value === 'number'
                        ? `₹${priceAttr.normalized_value.toLocaleString()} / mo`
                        : priceAttr.raw_value}
                    </span>
                  </div>
                )}

                {curfewDisplay && (
                  <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Curfew / Gate</span>
                    <span className="text-sm font-semibold text-stone-800 block mt-0.5 truncate" title={String(curfewDisplay)}>
                      {String(curfewDisplay)}
                    </span>
                  </div>
                )}

                {womenOnlyAttr && (
                  <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Admission Policy</span>
                    <span className="text-sm font-semibold text-rosewood-700 block mt-0.5">
                      {womenOnlyAttr.normalized_value ? "Strictly Women's Only" : 'Mixed Residency'}
                    </span>
                  </div>
                )}
              </div>

              {/* Room Configurations & Pricing */}
              {roomTypesAttr?.normalized_value && Array.isArray(roomTypesAttr.normalized_value) && (
                <div className="p-4 rounded-2xl bg-warm-50/60 border border-warm-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-brand-800 font-bold uppercase tracking-wider">
                    <Bed className="w-4 h-4 text-brand-700" />
                    <span>Published Room Configurations & Pricing</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roomTypesAttr.normalized_value.map((room: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-warm-200 space-y-1">
                        <span className="text-xs font-semibold text-stone-800 block">{room.accommodation_type}</span>
                        <span className="text-sm font-bold text-emerald-700 block">
                          {room.monthly_rent?.value ? `₹${room.monthly_rent.value.toLocaleString()}/mo` : 'Price on inquiry'}
                        </span>
                        {room.room_features && (
                          <span className="text-[11px] text-stone-500 block">{room.room_features}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meal & Policies */}
              {mealAttr?.normalized_value && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-amber-900 font-bold uppercase tracking-wider">
                    <UtensilsCrossed className="w-4 h-4 text-amber-700" />
                    <span>Meal & Fooding Policy</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-sans">
                    {String(mealAttr.normalized_value)}
                  </p>
                </div>
              )}

              {policiesAttr?.normalized_value && Array.isArray(policiesAttr.normalized_value) && (
                <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-stone-700 font-bold uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-brand-700" />
                    <span>Published House Rules & Guidelines</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-600 font-sans list-disc list-inside">
                    {policiesAttr.normalized_value.map((pol: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {pol}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Facilities */}
              {facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && (
                <div className="p-4 rounded-2xl bg-white border border-warm-200 space-y-2.5">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Verified Facilities & Infrastructure
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {facilitiesAttr.normalized_value.map((fac: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 rounded-lg bg-warm-50 border border-warm-200 text-stone-700 font-medium capitalize"
                      >
                        {fac.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HOSPITAL DOSSIER */}
          {resource.category === 'hospital' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resource.attributes.find((a) => a.field_name === 'emergency_24x7' || a.field_name === 'emergency_services') && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800 block">Emergency Status</span>
                    <span className="text-base font-bold text-rose-950 block mt-0.5">
                      {resource.attributes.find((a) => a.field_name === 'emergency_24x7')?.normalized_value ? '24x7 Trauma & Emergency Operational' : 'Standard Hospital Services'}
                    </span>
                  </div>
                )}
                <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Healthcare Facility Model</span>
                  <span className="text-base font-bold text-stone-800 block mt-0.5">
                    {resource.attributes.find((a) => a.field_name === 'hospital_type')?.normalized_value === 'government_public'
                      ? 'Government Public Medical University'
                      : resource.attributes.find((a) => a.field_name === 'hospital_type')?.normalized_value === 'private_tertiary_care'
                        ? 'Private Tertiary Care Hospital'
                        : resource.attributes.find((a) => a.field_name === 'hospital_type')?.raw_value || 'Hospital / Medical Centre'}
                  </span>
                </div>
              </div>

              {resource.attributes.find((a) => a.field_name === 'departments')?.normalized_value && Array.isArray(resource.attributes.find((a) => a.field_name === 'departments')?.normalized_value) && (
                <div className="p-4 rounded-2xl bg-white border border-warm-200 space-y-2.5">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                    Key Clinical Departments & Specialized Centers
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(resource.attributes.find((a) => a.field_name === 'departments')?.normalized_value as string[]).map((dept, idx) => (
                      <span key={idx} className="text-xs px-3 py-1.5 rounded-lg bg-warm-50 border border-warm-200 text-stone-800 font-medium">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PUBLIC TRANSPORT DOSSIER */}
          {resource.category === 'public_transport' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-sky-800 block">Corridor Network</span>
                  <span className="text-sm sm:text-base font-bold text-sky-950 block mt-0.5">
                    {String(resource.attributes.find((a) => a.field_name === 'route_line' || a.field_name === 'line')?.normalized_value || resource.attributes.find((a) => a.field_name === 'route_line' || a.field_name === 'line')?.raw_value || 'Metro Network')}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Operating Hours</span>
                  <span className="text-sm sm:text-base font-bold text-stone-800 block mt-0.5">
                    {(() => {
                      const t = resource.attributes.find((a) => a.field_name === 'timings');
                      if (typeof t?.normalized_value === 'object' && t.normalized_value !== null) {
                        return t.normalized_value.raw || (t.normalized_value.start && t.normalized_value.end ? `${t.normalized_value.start} - ${t.normalized_value.end}` : 'Schedule on notice');
                      }
                      return t?.normalized_value || t?.raw_value || 'Schedule on notice';
                    })()}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Fare Range</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-700 block mt-0.5">
                    {(() => {
                      const f = resource.attributes.find((a) => a.field_name === 'fare_range');
                      if (f?.normalized_value && typeof f.normalized_value === 'object' && f.normalized_value.min !== undefined && f.normalized_value.max !== undefined) {
                        return `₹${f.normalized_value.min} - ₹${f.normalized_value.max}`;
                      }
                      return f?.raw_value || 'Fare on inquiry';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PHARMACY DOSSIER */}
          {resource.category === 'pharmacy' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-800 block">Chemist Availability</span>
                  <span className="text-base font-bold text-emerald-950 block mt-0.5">
                    {resource.attributes.find((a) => a.field_name === 'timings')?.normalized_value === '24x7' ? '24x7 Round-the-Clock Operational' : resource.attributes.find((a) => a.field_name === 'timings')?.raw_value || 'Standard Operating Hours'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Home Delivery Service</span>
                  <span className="text-base font-bold text-stone-800 block mt-0.5">
                    {resource.attributes.find((a) => a.field_name === 'home_delivery')?.normalized_value === true
                      ? '✓ Home Delivery Available'
                      : resource.attributes.find((a) => a.field_name === 'home_delivery')?.normalized_value === false
                        ? 'In-Store Pickup Only'
                        : 'Delivery on inquiry'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* POLICE DOSSIER */}
          {resource.category === 'police_or_public_support' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-indigo-800 block">Women Desk Infrastructure</span>
                  <span className="text-base font-bold text-indigo-950 block mt-0.5">
                    {resource.attributes.find((a) => a.field_name === 'facilities')?.normalized_value && Array.isArray(resource.attributes.find((a) => a.field_name === 'facilities')?.normalized_value) && (resource.attributes.find((a) => a.field_name === 'facilities')?.normalized_value as string[]).includes('mission_shakti_desk')
                      ? 'Mission Shakti Help Desk Active'
                      : 'Police Station Assistance'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Emergency Response</span>
                  <span className="text-base font-bold text-indigo-900 block mt-0.5">
                    Dial {resource.attributes.find((a) => a.field_name === 'emergency_contact')?.raw_value || '112'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* WOMEN SUPPORT DOSSIER */}
          {resource.category === 'women_support' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800 block">Support Entity</span>
                  <span className="text-sm font-bold text-rose-950 block mt-0.5">
                    {String(resource.attributes.find((a) => a.field_name === 'organization_type')?.raw_value || resource.attributes.find((a) => a.field_name === 'organization_type')?.normalized_value || 'Women Welfare Support Centre')}
                  </span>
                </div>
                {resource.attributes.find((a) => a.field_name === 'helpline_numbers') && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800 block">Helpline Numbers</span>
                    <span className="text-base font-bold text-rosewood-700 block mt-0.5">
                      {Array.isArray(resource.attributes.find((a) => a.field_name === 'helpline_numbers')?.normalized_value)
                        ? (resource.attributes.find((a) => a.field_name === 'helpline_numbers')?.normalized_value as string[]).join(' • ')
                        : resource.attributes.find((a) => a.field_name === 'helpline_numbers')?.raw_value}
                    </span>
                  </div>
                )}
              </div>

              {resource.attributes.find((a) => a.field_name === 'services_offered')?.normalized_value && Array.isArray(resource.attributes.find((a) => a.field_name === 'services_offered')?.normalized_value) && (
                <div className="p-4 rounded-2xl bg-white border border-warm-200 space-y-2.5">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                    Comprehensive Crisis Intervention & Welfare Services
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(resource.attributes.find((a) => a.field_name === 'services_offered')?.normalized_value as string[]).map((srv, idx) => (
                      <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-warm-50 border border-warm-200 text-stone-800 font-medium capitalize">
                        {srv.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">
                Published Contact Numbers
              </span>
              <span className="text-sm font-semibold text-stone-900 mt-0.5 block">
                {resource.primary_contact || 'Inquire directly at source'}
              </span>
            </div>
            {resource.source_url && (
              <a
                href={resource.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-warm-100 text-stone-800 text-xs font-semibold border border-warm-300 shadow-2xs transition-colors"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Attached Evidence Quotes */}
          {resource.evidence_cards.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Attached Evidence Quotes ({resource.evidence_cards.length})
              </span>
              <div className="space-y-2">
                {resource.evidence_cards.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectEvidence(ev)}
                    className="p-3.5 rounded-2xl bg-warm-50 hover:bg-warm-100/80 border border-warm-200 hover:border-brand-300 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rosewood-700 font-semibold capitalize">{ev.field_name.replace(/_/g, ' ')}</span>
                      <span className="text-stone-400 text-[11px]">View Provenance →</span>
                    </div>
                    <p className="text-xs text-stone-700 italic font-serif leading-relaxed">"{ev.evidence_quote}"</p>
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
