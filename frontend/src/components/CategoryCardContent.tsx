import React from 'react';
import { ResourceDetail, EvidenceCard } from '../types';
import {
  ShieldCheck, Bed, UtensilsCrossed, FileText, Stethoscope,
  Activity, Train, Clock, IndianRupee, Pill, Shield, HeartHandshake,
  PhoneCall, Building2, MapPin, CheckCircle2
} from 'lucide-react';

interface CategoryContentProps {
  resource: ResourceDetail;
  onSelectEvidence: (evidence: EvidenceCard) => void;
}

// 1. WOMEN HOSTEL CONTENT
export const HostelCardContent: React.FC<CategoryContentProps> = ({ resource, onSelectEvidence }) => {
  const priceAttr = resource.attributes.find((a) => a.field_name === 'monthly_price');
  const curfewAttr = resource.attributes.find((a) => a.field_name === 'curfew_time');
  const womenOnlyAttr = resource.attributes.find((a) => a.field_name === 'women_only');
  const roomTypesAttr = resource.attributes.find((a) => a.field_name === 'room_types');
  const mealAttr = resource.attributes.find((a) => a.field_name === 'meal_details');
  const policiesAttr = resource.attributes.find((a) => a.field_name === 'policies');
  const facilitiesAttr = resource.attributes.find((a) => a.field_name === 'facilities');

  const curfewDisplay = typeof curfewAttr?.normalized_value === 'object' && curfewAttr?.normalized_value !== null
    ? curfewAttr.normalized_value.raw || (curfewAttr.normalized_value.start && curfewAttr.normalized_value.end ? `${curfewAttr.normalized_value.start} - ${curfewAttr.normalized_value.end}` : null)
    : curfewAttr?.normalized_value || curfewAttr?.raw_value || null;

  return (
    <div className="space-y-3 pt-1">
      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Starting Rent */}
        {priceAttr && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'monthly_price');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-3 rounded-xl bg-warm-50/80 border border-warm-300/80 hover:border-brand-400 transition-colors group cursor-pointer"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Starting Rent</span>
            <span className="text-base font-bold text-emerald-700 block mt-0.5">
              {typeof priceAttr.normalized_value === 'number'
                ? `₹${priceAttr.normalized_value.toLocaleString()} / mo`
                : priceAttr.raw_value}
            </span>
            <span className="text-[11px] text-stone-400 group-hover:text-brand-700 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Evidence
            </span>
          </div>
        )}

        {/* Curfew */}
        {curfewDisplay && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'curfew_time');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-3 rounded-xl bg-warm-50/80 border border-warm-300/80 hover:border-brand-400 transition-colors group cursor-pointer"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Gate / Curfew</span>
            <span className="text-sm font-semibold text-stone-800 block mt-0.5 truncate" title={String(curfewDisplay)}>
              {String(curfewDisplay)}
            </span>
            <span className="text-[11px] text-stone-400 group-hover:text-brand-700 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Evidence
            </span>
          </div>
        )}

        {/* Occupancy Policy */}
        {womenOnlyAttr && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'women_only');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-3 rounded-xl bg-warm-50/80 border border-warm-300/80 hover:border-brand-400 transition-colors group cursor-pointer"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Admission Policy</span>
            <span className="text-sm font-semibold text-rosewood-700 block mt-0.5">
              {womenOnlyAttr.normalized_value ? "Strictly Women's Only" : 'Mixed Residency'}
            </span>
            <span className="text-[11px] text-stone-400 group-hover:text-brand-700 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Evidence
            </span>
          </div>
        )}
      </div>

      {/* Room Types Breakdown */}
      {roomTypesAttr?.normalized_value && Array.isArray(roomTypesAttr.normalized_value) && (
        <div className="p-3.5 rounded-xl bg-white border border-warm-300 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-brand-700" />
            <span>Room Configurations & Pricing</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {roomTypesAttr.normalized_value.map((room: any, rIdx: number) => (
              <div key={rIdx} className="px-3 py-1.5 rounded-lg bg-warm-50 border border-warm-200 text-xs">
                <span className="text-stone-700 font-medium">{room.accommodation_type}: </span>
                <span className="text-emerald-700 font-bold">
                  {room.monthly_rent?.value ? `₹${room.monthly_rent.value.toLocaleString()}/mo` : 'Price on inquiry'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Details & Policy Badges */}
      {(mealAttr?.normalized_value || policiesAttr?.normalized_value) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {mealAttr?.normalized_value && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1.5 font-medium">
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
              <span>{String(mealAttr.normalized_value)}</span>
            </span>
          )}
          {policiesAttr?.normalized_value && Array.isArray(policiesAttr.normalized_value) && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rosewood-700 flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              <span>{policiesAttr.normalized_value.length} Verified House Rules</span>
            </span>
          )}
        </div>
      )}

      {/* Facilities tags */}
      {facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {facilitiesAttr.normalized_value.slice(0, 5).map((fac: string, idx: number) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded-lg bg-warm-100/90 text-stone-700 border border-warm-300 font-medium capitalize"
            >
              {fac.replace(/_/g, ' ')}
            </span>
          ))}
          {facilitiesAttr.normalized_value.length > 5 && (
            <span className="text-xs text-stone-500 self-center font-medium">
              +{facilitiesAttr.normalized_value.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// 2. HOSPITAL CONTENT
export const HospitalCardContent: React.FC<CategoryContentProps> = ({ resource, onSelectEvidence }) => {
  const emergencyAttr = resource.attributes.find((a) => a.field_name === 'emergency_24x7' || a.field_name === 'emergency_services');
  const typeAttr = resource.attributes.find((a) => a.field_name === 'hospital_type');
  const deptAttr = resource.attributes.find((a) => a.field_name === 'departments');
  const facilitiesAttr = resource.attributes.find((a) => a.field_name === 'facilities');

  const hospitalTypeDisplay = typeAttr?.normalized_value === 'government_public'
    ? 'Government Public Medical University'
    : typeAttr?.normalized_value === 'private_tertiary_care'
      ? 'Private Tertiary Care Hospital'
      : typeAttr?.raw_value || 'Hospital / Healthcare Facility';

  return (
    <div className="space-y-3 pt-1">
      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {emergencyAttr && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'emergency_24x7' || c.field_name === 'emergency_services');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 hover:border-rose-300 transition-colors group cursor-pointer"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800 block">Emergency Status</span>
            <span className="text-sm font-semibold text-rose-950 block mt-0.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>{emergencyAttr.normalized_value ? '24x7 Trauma & Emergency Operational' : 'Standard Operating Hours'}</span>
            </span>
            <span className="text-[11px] text-stone-500 group-hover:text-rose-800 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Evidence
            </span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-warm-50/80 border border-warm-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Healthcare Facility Type</span>
          <span className="text-sm font-semibold text-stone-800 block mt-0.5">
            {hospitalTypeDisplay}
          </span>
          <span className="text-[11px] text-stone-500 block mt-1">
            {typeAttr?.normalized_value === 'government_public' ? 'Direct public medical service' : 'Tertiary multispecialty center'}
          </span>
        </div>
      </div>

      {/* Departments & Specialties */}
      {deptAttr?.normalized_value && Array.isArray(deptAttr.normalized_value) && (
        <div className="p-3.5 rounded-xl bg-white border border-warm-300 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-rose-700" />
            <span>Key Clinical Departments & Wards</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {deptAttr.normalized_value.slice(0, 8).map((dept: string, idx: number) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-warm-50 border border-warm-200 text-stone-800 font-medium"
              >
                {dept}
              </span>
            ))}
            {deptAttr.normalized_value.length > 8 && (
              <span className="text-xs text-stone-500 self-center font-medium">
                +{deptAttr.normalized_value.length - 8} more departments
              </span>
            )}
          </div>
        </div>
      )}

      {/* Facilities */}
      {facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {facilitiesAttr.normalized_value.map((fac: string, idx: number) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-0.5 rounded-lg bg-warm-100 text-stone-700 border border-warm-300 font-medium"
            >
              {fac}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. PUBLIC TRANSPORT CONTENT
export const TransitCardContent: React.FC<CategoryContentProps> = ({ resource }) => {
  const lineAttr = resource.attributes.find((a) => a.field_name === 'route_line' || a.field_name === 'line');
  const timingsAttr = resource.attributes.find((a) => a.field_name === 'timings');
  const fareAttr = resource.attributes.find((a) => a.field_name === 'fare_range');
  const opAttr = resource.attributes.find((a) => a.field_name === 'operator');
  const womensCoachAttr = resource.attributes.find((a) => a.field_name === 'womens_coach_facility');

  const timingsDisplay = typeof timingsAttr?.normalized_value === 'object' && timingsAttr?.normalized_value !== null
    ? timingsAttr.normalized_value.raw || (timingsAttr.normalized_value.start && timingsAttr.normalized_value.end ? `${timingsAttr.normalized_value.start} - ${timingsAttr.normalized_value.end}` : null)
    : timingsAttr?.normalized_value || timingsAttr?.raw_value || null;

  const fareDisplay = fareAttr?.normalized_value && typeof fareAttr.normalized_value === 'object' && fareAttr.normalized_value.min !== undefined && fareAttr.normalized_value.max !== undefined
    ? `₹${fareAttr.normalized_value.min} - ₹${fareAttr.normalized_value.max}`
    : fareAttr?.raw_value || 'Fare on inquiry';

  return (
    <div className="space-y-3 pt-1">
      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200">
          <span className="text-[11px] font-medium uppercase tracking-wider text-sky-800 block">Corridor Line</span>
          <span className="text-sm font-semibold text-sky-950 block mt-0.5 flex items-center gap-1.5 truncate">
            <Train className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span>{lineAttr?.normalized_value ? String(lineAttr.normalized_value) : lineAttr?.raw_value ? String(lineAttr.raw_value) : 'Metro Transit Corridor'}</span>
          </span>
          <span className="text-[11px] text-sky-700 block mt-1">
            {opAttr?.normalized_value ? String(opAttr.normalized_value) : 'Operator: UPMRC'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-warm-50/80 border border-warm-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Operational Schedule</span>
          <span className="text-sm font-semibold text-stone-800 block mt-0.5 flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span>{timingsDisplay ? String(timingsDisplay) : 'Schedule on notice'}</span>
          </span>
          <span className="text-[11px] text-stone-500 block mt-1">Daily Train Frequency</span>
        </div>

        <div className="p-3 rounded-xl bg-warm-50/80 border border-warm-300 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Token / Card Fare</span>
          <span className="text-sm font-semibold text-emerald-700 block mt-0.5 flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{fareDisplay}</span>
          </span>
          <span className="text-[11px] text-stone-500 block mt-1">Standard Distance Fare</span>
        </div>
      </div>

      {/* Safety Badge (rendered only if safety attributes exist or standard transit) */}
      {womensCoachAttr?.normalized_value === true && (
        <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200/80 text-xs font-medium text-sky-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
          <span>Dedicated Women's Coach & CCTV Surveillance verified for station</span>
        </div>
      )}
    </div>
  );
};

// 4. PHARMACY CONTENT
export const PharmacyCardContent: React.FC<CategoryContentProps> = ({ resource }) => {
  const timingsAttr = resource.attributes.find((a) => a.field_name === 'timings');
  const deliveryAttr = resource.attributes.find((a) => a.field_name === 'home_delivery');
  const suppliesAttr = resource.attributes.find((a) => a.field_name === 'essential_supplies');

  const is24x7 = timingsAttr?.normalized_value === '24x7' || timingsAttr?.raw_value?.includes('24');

  return (
    <div className="space-y-3 pt-1">
      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-800 block">Operating Hours</span>
          <span className="text-sm font-semibold text-emerald-950 block mt-0.5 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-emerald-700" />
            <span>{is24x7 ? '24x7 Round-the-Clock Chemist' : timingsAttr?.raw_value || 'Standard Operating Hours'}</span>
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1">
            {is24x7 ? 'Emergency Medication Stocked' : 'Pharmacy Dispensary'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-warm-50/80 border border-warm-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Delivery Service</span>
          <span className="text-sm font-semibold text-stone-800 block mt-0.5">
            {deliveryAttr?.normalized_value === true
              ? '✓ Home Delivery Operational'
              : deliveryAttr?.normalized_value === false
                ? 'In-Store Pickup Only'
                : 'Delivery on inquiry'}
          </span>
          <span className="text-[11px] text-stone-500 block mt-1">Prescription & Medical Supplies</span>
        </div>
      </div>

      {/* Supplies */}
      {suppliesAttr?.normalized_value && Array.isArray(suppliesAttr.normalized_value) && (
        <div className="p-3.5 rounded-xl bg-white border border-warm-300 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Essential Medical Inventory</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suppliesAttr.normalized_value.map((sup: string, idx: number) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-warm-50 border border-warm-200 text-stone-800 font-medium capitalize"
              >
                {sup.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 5. POLICE & HELP DESK CONTENT
export const PoliceCardContent: React.FC<CategoryContentProps> = ({ resource }) => {
  const stationTypeAttr = resource.attributes.find((a) => a.field_name === 'station_type');
  const emergencyContactAttr = resource.attributes.find((a) => a.field_name === 'emergency_contact');
  const facilitiesAttr = resource.attributes.find((a) => a.field_name === 'facilities');

  const hasHelpDesk = facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && (
    facilitiesAttr.normalized_value.includes('mission_shakti_desk') || facilitiesAttr.normalized_value.includes('lady_officer_24x7')
  );

  return (
    <div className="space-y-3 pt-1">
      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200">
          <span className="text-[11px] font-medium uppercase tracking-wider text-indigo-800 block">Women Safety Infrastructure</span>
          <span className="text-sm font-semibold text-indigo-950 block mt-0.5 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-700" />
            <span>{hasHelpDesk ? 'Mission Shakti Women Help Desk Active' : 'Police Station & Women Assistance'}</span>
          </span>
          <span className="text-[11px] text-indigo-700 block mt-1">
            {facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && facilitiesAttr.normalized_value.includes('lady_officer_24x7')
              ? 'Lady Officer 24x7 In-Charge'
              : 'UP Police Station'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-warm-50/80 border border-warm-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Emergency Dispatch</span>
          <span className="text-sm font-semibold text-indigo-900 block mt-0.5 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-indigo-600" />
            <span>Dial {emergencyContactAttr?.raw_value || '112'} (Police Response)</span>
          </span>
          <span className="text-[11px] text-stone-500 block mt-1">24x7 Local Patrol Routing</span>
        </div>
      </div>

      {/* Facilities & Services */}
      {facilitiesAttr?.normalized_value && Array.isArray(facilitiesAttr.normalized_value) && (
        <div className="p-3.5 rounded-xl bg-white border border-warm-300 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
            <span>Station Services & Safety Facilities</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {facilitiesAttr.normalized_value.map((srv: string, idx: number) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-warm-50 border border-warm-200 text-stone-800 font-medium capitalize"
              >
                {srv.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 6. WOMEN SUPPORT & CRISIS CENTRES CONTENT
export const WomenSupportCardContent: React.FC<CategoryContentProps> = ({ resource, onSelectEvidence }) => {
  const orgTypeAttr = resource.attributes.find((a) => a.field_name === 'organization_type');
  const servicesAttr = resource.attributes.find((a) => a.field_name === 'services_offered');
  const helplinesAttr = resource.attributes.find((a) => a.field_name === 'helpline_numbers');

  const orgTypeDisplay = orgTypeAttr?.raw_value || orgTypeAttr?.normalized_value || 'Women Support Organisation';

  return (
    <div className="space-y-3 pt-1">
      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div
          onClick={(e) => {
            e.stopPropagation();
            const ev = resource.evidence_cards.find((c) => c.field_name === 'organization_type');
            if (ev) onSelectEvidence(ev);
          }}
          className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 hover:border-rose-300 transition-colors group cursor-pointer"
        >
          <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800 block">Support Entity</span>
          <span className="text-sm font-semibold text-rose-950 block mt-0.5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-700" />
            <span className="truncate">{String(orgTypeDisplay)}</span>
          </span>
          <span className="text-[11px] text-stone-500 group-hover:text-brand-700 transition-colors flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Evidence
          </span>
        </div>

        {helplinesAttr && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              const ev = resource.evidence_cards.find((c) => c.field_name === 'helpline_numbers');
              if (ev) onSelectEvidence(ev);
            }}
            className="p-3 rounded-xl bg-warm-50/80 border border-warm-300 hover:border-brand-400 transition-colors group cursor-pointer"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block">Helpline Numbers</span>
            <span className="text-sm font-bold text-rosewood-700 block mt-0.5 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-brand-700" />
              <span>
                {Array.isArray(helplinesAttr.normalized_value)
                  ? helplinesAttr.normalized_value.join(' • ')
                  : helplinesAttr.raw_value || 'Inquire at centre'}
              </span>
            </span>
            <span className="text-[11px] text-stone-500 group-hover:text-brand-700 transition-colors flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Evidence
            </span>
          </div>
        )}
      </div>

      {/* Services Offered */}
      {servicesAttr?.normalized_value && Array.isArray(servicesAttr.normalized_value) && (
        <div className="p-3.5 rounded-xl bg-white border border-warm-300 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-brand-700" />
            <span>Integrated Crisis Intervention Services</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {servicesAttr.normalized_value.map((srv: string, idx: number) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-warm-50 border border-warm-200 text-stone-800 font-medium capitalize"
              >
                {srv.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
