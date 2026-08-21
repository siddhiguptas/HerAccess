import React, { useState, useEffect } from 'react';
import { ChangeEventDetail } from '../types';
import { api } from '../api';
import { History, ArrowRight, RefreshCw, PlusCircle, Edit3, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

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

  const getChangeTheme = (type: string) => {
    switch (type) {
      case 'added':
        return {
          icon: PlusCircle,
          label: 'Added',
          color: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'removed':
        return {
          icon: Trash2,
          label: 'Removed',
          color: 'text-rose-700',
          bg: 'bg-rose-50 border-rose-200',
          badge: 'bg-rose-50 text-rose-800 border-rose-200'
        };
      case 'modified':
      default:
        return {
          icon: Edit3,
          label: 'Updated',
          color: 'text-sky-700',
          bg: 'bg-sky-50 border-sky-200',
          badge: 'bg-sky-50 text-sky-800 border-sky-200'
        };
    }
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return 'None';
    if (typeof val === 'number') return `₹${val.toLocaleString()}`;
    if (typeof val === 'boolean') return val ? 'Yes / Active' : 'No / Inactive';
    if (Array.isArray(val)) return val.map((item) => String(item).replace(/_/g, ' ')).join(', ');
    if (typeof val === 'object') {
      if (val.raw) return String(val.raw);
      if (val.start && val.end) return `${val.start} - ${val.end}`;
      if (val.min !== undefined && val.max !== undefined) return `₹${val.min} - ₹${val.max}`;
      return JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-sky-700" />
            <span>Temporal Snapshot Diffing</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Observed Changes Over Time</h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            HerAccess compares successive source observations to automatically flag price adjustments, curfew mutations, and safety policy modifications.
          </p>
        </div>

        <button
          onClick={fetchChanges}
          className="p-2.5 rounded-xl bg-white hover:bg-warm-50 text-stone-700 border border-warm-300 shadow-2xs transition-colors"
          title="Refresh changes"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {changes.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-warm-300 text-stone-600 space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-warm-100 border border-warm-200 flex items-center justify-center mx-auto text-stone-500">
            <ShieldCheck className="w-6 h-6 text-brand-700" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">No changes observed yet</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            HerAccess will surface price, policy, availability and service changes after comparing successive source observations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {changes.map((c) => {
            const theme = getChangeTheme(c.change_type);
            const Icon = theme.icon;
            return (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white border border-warm-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-warm-400 transition-colors shadow-2xs"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl border ${theme.bg} ${theme.color} shrink-0 mt-1 sm:mt-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-stone-900">{c.resource_name}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                        {c.field_name.replace(/_/g, ' ')} {theme.label}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 mt-2 flex items-center gap-2 flex-wrap font-sans">
                      {c.change_type === 'modified' && c.old_value !== null && c.new_value !== null && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warm-50 border border-warm-200">
                          <span className="text-stone-400 line-through">
                            {formatValue(c.old_value)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-stone-400" />
                          <span className="font-bold text-emerald-700">
                            {formatValue(c.new_value)}
                          </span>
                        </div>
                      )}

                      {c.change_type === 'added' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                          <span className="text-emerald-800 font-medium">New:</span>
                          <span className="font-bold text-emerald-700">{formatValue(c.new_value)}</span>
                        </div>
                      )}

                      {c.change_type === 'removed' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/80 border border-rose-200">
                          <span className="text-rose-800 font-medium">Prior:</span>
                          <span className="text-stone-400 line-through">{formatValue(c.old_value)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-stone-500 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-warm-200">
                  <span className="text-stone-700 font-medium block">
                    Observed: {new Date(c.detected_at).toLocaleDateString()}
                  </span>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-warm-100 text-stone-600 text-[11px] border border-warm-200">
                    {c.collector_id ? `Collector: ${c.collector_id}` : 'Collector not recorded'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
