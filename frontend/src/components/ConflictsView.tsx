import React, { useState, useEffect } from 'react';
import { ConflictDetail } from '../types';
import { api } from '../api';
import { AlertCircle, ExternalLink, RefreshCw, Scale, CheckCircle2 } from 'lucide-react';

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            <span>Cross-Source Discrepancy Engine</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Factual Variance & Discrepancies</h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            When multiple public sources report differing prices, curfews, or admission rules, HerAccess transparently preserves both citations rather than guessing.
          </p>
        </div>

        <button
          onClick={fetchConflicts}
          className="p-2.5 rounded-xl bg-white hover:bg-warm-50 text-stone-700 border border-warm-300 shadow-2xs transition-colors"
          title="Refresh conflicts"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {conflicts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-warm-300 text-stone-600 text-sm space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="font-semibold text-stone-800">All Checked Sources In Agreement</p>
          <p className="text-xs text-stone-500">No active unresolved cross-source discrepancies found across indexed listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conflicts.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-white border border-warm-300 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                      Factual Variance: {c.field_name.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-warm-100 text-stone-600 border border-warm-200">
                      Unresolved Citation
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mt-2">{c.resource_name}</h3>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Detected: {new Date(c.detected_at).toLocaleDateString()}
                </span>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Claim A */}
                <div className="p-5 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span className="uppercase tracking-wider">Source Citation A</span>
                    <span>{new Date(c.source_a_observed_at || c.detected_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-base font-bold text-stone-900">
                    {String(c.value_a)}
                  </div>
                  <a
                    href={c.source_a_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-rosewood-700 hover:underline pt-1 truncate block max-w-full font-medium"
                  >
                    <span className="truncate">{c.source_a_url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>

                {/* Claim B */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
                    <span className="uppercase tracking-wider font-semibold">Source Citation B</span>
                    <span className="text-amber-800">{new Date(c.source_b_observed_at || c.detected_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-base font-bold text-amber-950">
                    {String(c.value_b)}
                  </div>
                  <a
                    href={c.source_b_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-rosewood-700 hover:underline pt-1 truncate block max-w-full font-medium"
                  >
                    <span className="truncate">{c.source_b_url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
