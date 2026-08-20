import React, { useState, useEffect } from 'react';
import { ChangeEventDetail } from '../types';
import { api } from '../api';
import { History, ArrowRight, RefreshCw, PlusCircle, Edit3, Trash2 } from 'lucide-react';

export const ChangesFeed: React.FC = () => {
  const [changes, setChanges] = useState<ChangeEventDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChanges = async () => {
    try {
      setIsLoading(true);
      const data = await api.getChanges();
      setChanges(data);
    } catch (err) {
      console.error('Failed to load changes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return { icon: PlusCircle, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800' };
      case 'removed':
        return { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800' };
      case 'modified':
      default:
        return { icon: Edit3, color: 'text-sky-400', bg: 'bg-sky-950/60 border-sky-800' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono mb-2">
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>Temporal Snapshot Diffing</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Observed Changes Over Time</h2>
          <p className="text-sm text-slate-400">
            Comparing historical snapshots from consecutive Bright Data collection runs.
          </p>
        </div>

        <button
          onClick={fetchChanges}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {changes.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 font-mono text-xs">
          No historical snapshot diffs recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {changes.map((c) => {
            const { icon: Icon, color, bg } = getChangeIcon(c.change_type);
            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${bg} ${color} shrink-0 mt-1 sm:mt-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{c.resource_name}</span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        {c.field_name.replace(/_/g, ' ').toUpperCase()} CHANGED
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-2 flex-wrap">
                      {c.old_value !== null && c.new_value !== null && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 line-through">
                            {typeof c.old_value === 'number' ? `₹${c.old_value.toLocaleString()}` : String(c.old_value)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="font-bold text-emerald-400">
                            {typeof c.new_value === 'number' ? `₹${c.new_value.toLocaleString()}` : String(c.new_value)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs font-mono text-slate-400 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="text-slate-300 block">Observed: {new Date(c.detected_at).toLocaleDateString()}</span>
                  {c.collector_id && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-800 text-brand-300 text-[10px]">
                      Collector: {c.collector_id}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
