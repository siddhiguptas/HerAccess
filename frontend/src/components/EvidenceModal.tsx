import React from 'react';
import { EvidenceCard } from '../types';
import { X, ExternalLink, ShieldCheck, Clock, Terminal, Quote } from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';

interface Props {
  evidence: EvidenceCard | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<Props> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                Source Evidence & Provenance
              </h3>
              <p className="text-xs text-slate-400">Verifiable public citation extracted via Bright Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Claimed Fact */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Extracted Attribute: <span className="text-brand-300">{evidence.field_name.replace(/_/g, ' ')}</span>
            </span>
            <div className="text-base font-semibold text-white">
              {typeof evidence.claimed_value === 'boolean'
                ? evidence.claimed_value ? 'Confirmed / Verified' : 'Not Available'
                : typeof evidence.claimed_value === 'object'
                  ? JSON.stringify(evidence.claimed_value)
                  : String(evidence.claimed_value)}
            </div>
          </div>

          {/* Verbatim Source Evidence Quote */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              <Quote className="w-3.5 h-3.5 text-brand-400" />
              <span>Verbatim Source Excerpt</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/90 border-l-4 border-brand-500 border-y border-r border-slate-800 text-sm text-slate-200 leading-relaxed font-sans italic">
              "{evidence.evidence_quote}"
            </div>
          </div>

          {/* Explicit 6-Step Visual Provenance Chain */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-300 font-semibold block">
              Verified Provenance Chain
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">1. Claim / Field</span>
                <span className="text-white font-medium capitalize">{evidence.field_name.replace(/_/g, ' ')}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">2. Source URL</span>
                <span className="text-sky-300 truncate block">{evidence.source_domain}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">3. Collector ID</span>
                <span className="text-brand-300 font-semibold">{evidence.collector_id}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">4. Observation Timestamp</span>
                <span className="text-slate-200">{new Date(evidence.observed_at).toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">5. Freshness Tier</span>
                <FreshnessBadge level={evidence.freshness_level} observedAt={evidence.observed_at} className="mt-0.5" />
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">6. Verification Status</span>
                <span className="text-emerald-400 font-semibold uppercase">{evidence.verification_status}</span>
              </div>
            </div>
          </div>

          {/* External Source Link */}
          <div className="pt-2">
            <a
              href={evidence.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700 transition-colors"
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
