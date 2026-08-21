import React from 'react';
import { EvidenceCard } from '../types';
import { X, ExternalLink, ShieldCheck, Clock, Quote, CheckCircle2 } from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';

interface Props {
  evidence: EvidenceCard | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<Props> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white border border-warm-300 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-warm-200 bg-warm-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Source Evidence & Provenance
              </h3>
              <p className="text-xs text-stone-500">Verifiable public citation extracted via Bright Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Claimed Fact */}
          <div className="bg-warm-50/80 p-4 rounded-2xl border border-warm-200">
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 block mb-1">
              Extracted Attribute: <span className="text-rosewood-700 font-semibold">{evidence.field_name.replace(/_/g, ' ')}</span>
            </span>
            <div className="text-base font-bold text-stone-900">
              {typeof evidence.claimed_value === 'boolean'
                ? evidence.claimed_value ? 'Confirmed / Verified' : 'Not Available'
                : typeof evidence.claimed_value === 'object'
                  ? JSON.stringify(evidence.claimed_value)
                  : String(evidence.claimed_value)}
            </div>
          </div>

          {/* Verbatim Source Evidence Quote */}
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-600 font-semibold uppercase tracking-wider mb-2">
              <Quote className="w-4 h-4 text-brand-700" />
              <span>Verbatim Source Excerpt</span>
            </div>
            <div className="p-4 rounded-2xl bg-warm-50 border-l-4 border-brand-700 border-y border-r border-warm-200 text-sm text-stone-800 leading-relaxed font-serif italic">
              "{evidence.evidence_quote}"
            </div>
          </div>

          {/* Explicit 6-Step Visual Provenance Chain */}
          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200 space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-700 font-bold block">
              Verified Provenance Chain
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-warm-200">
                <span className="text-[10px] text-stone-500 block font-medium">1. Claim / Field</span>
                <span className="text-stone-900 font-semibold capitalize">{evidence.field_name.replace(/_/g, ' ')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-warm-200">
                <span className="text-[10px] text-stone-500 block font-medium">2. Source Domain</span>
                <span className="text-brand-800 font-semibold truncate block">{evidence.source_domain}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-warm-200">
                <span className="text-[10px] text-stone-500 block font-medium">3. Collector</span>
                <span className="text-stone-700 font-medium">{evidence.collector_id}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-warm-200">
                <span className="text-[10px] text-stone-500 block font-medium">4. Observation Recorded</span>
                <span className="text-stone-700">{new Date(evidence.observed_at).toLocaleDateString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-warm-200">
                <span className="text-[10px] text-stone-500 block font-medium">5. Freshness Tier</span>
                <FreshnessBadge level={evidence.freshness_level} observedAt={evidence.observed_at} className="mt-1" />
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-warm-200">
                <span className="text-[10px] text-stone-500 block font-medium">6. Verification Status</span>
                <span className="text-emerald-700 font-bold uppercase mt-0.5 block">{evidence.verification_status}</span>
              </div>
            </div>
          </div>

          {/* External Source Link */}
          <div className="pt-1">
            <a
              href={evidence.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
            >
              <span>Verify at Original Public Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
