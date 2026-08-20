import React, { useState, useEffect } from 'react';
import { ConflictDetail } from '../types';
import { api } from '../api';
import { AlertCircle, ExternalLink, RefreshCw, Scale } from 'lucide-react';

export const ConflictsView: React.FC = () => {
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConflicts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getConflicts();
      setConflicts(data);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono mb-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Cross-Source Discrepancy Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Conflicting Public Information</h2>
          <p className="text-sm text-slate-400">
            When multiple public sources disagree on critical facts, HerAccess preserves both citations transparently.
          </p>
        </div>

        <button
          onClick={fetchConflicts}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {conflicts.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 font-mono text-xs">
          ✓ No active unresolved cross-source discrepancies found across checked sources.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conflicts.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-amber-800/70 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/80 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      Information Conflict Detected: {c.field_name.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Status: Unresolved
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mt-2">{c.resource_name}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Detected: {new Date(c.detected_at).toLocaleDateString()}
                </span>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Claim A */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="uppercase tracking-wider">Source Claim A</span>
                    <span>Observed: {new Date(c.source_a_observed_at || c.detected_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-base font-semibold text-white font-mono">
                    {String(c.value_a)}
                  </div>
                  <a
                    href={c.source_a_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-300 hover:underline pt-1 truncate block max-w-full"
                  >
                    <span className="truncate">{c.source_a_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Claim B */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                    <span className="uppercase tracking-wider">Source Claim B</span>
                    <span className="text-slate-400">Observed: {new Date(c.source_b_observed_at || c.detected_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-base font-semibold text-amber-300 font-mono">
                    {String(c.value_b)}
                  </div>
                  <a
                    href={c.source_b_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-300 hover:underline pt-1 truncate block max-w-full"
                  >
                    <span className="truncate">{c.source_b_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
