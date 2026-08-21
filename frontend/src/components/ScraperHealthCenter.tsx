import React, { useState, useEffect } from 'react';
import { HealthDashboardResponse } from '../types';
import { api } from '../api';
import {
  Activity, ShieldCheck, AlertTriangle, RefreshCw, Play,
  CheckCircle2, AlertCircle, Wrench, Database, Globe, ArrowUpRight
} from 'lucide-react';

const REAL_COLLECTOR_IDS = new Set([
  'c_mt1f0ke713h6n32pi4', // Kamla Girls Hostel
  'c_mt1i5ri4trltbvw66', // Sulekha Women Hostels
  'c_mt1palv71amwtj4yp4', // University of Lucknow Women Hostels
  'c_mt1nlu1w3pkwb2h1i', // Lucknow Metro Wikipedia
  'c_mt1fujyq16vhxxfg7x', // KGMU Hospital
  'c_mt1ogapv1t1nhs5rht', // Apollo Hospitals Lucknow
  'c_mt1qwsbmqm9fi1vu6', // UP Mahila Kalyan Women Support
]);

export const ScraperHealthCenter: React.FC = () => {
  const [dashboard, setDashboard] = useState<HealthDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runningCollector, setRunningCollector] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getHealthDashboard();
      setDashboard(data);
    } catch (err: any) {
      console.error('Failed to load health dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRunCollector = async (collectorId: string) => {
    try {
      setRunningCollector(collectorId);
      setMessage(`Triggering collector ${collectorId}...`);
      const res = await api.triggerCollectorRun(collectorId);
      setMessage(`Collector run complete: ${res.records_ingested} records ingested with ${res.validation_pass_rate * 100}% validation.`);
      await fetchDashboard();
    } catch (err: any) {
      setMessage(`Error running collector: ${err.message}`);
    } finally {
      setRunningCollector(null);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div className="p-12 text-center text-stone-500 font-sans text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-brand-700" />
        <span>Loading Data Transparency Center...</span>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rosewood-700 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-brand-700" />
            <span>Data Transparency & Provenance Center</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Source Extraction Health</h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Live telemetry of verified Bright Data collectors, schema validation pass rates, and automated self-healing events.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-warm-50 text-stone-800 text-xs font-semibold border border-warm-300 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rosewood-700 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-700 font-bold">✕</button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-warm-300 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>COLLECTORS</span>
            <Globe className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{dashboard.total_collectors}</div>
          <div className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{dashboard.healthy_count} Healthy / {dashboard.failed_count} Issues</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-warm-300 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>VALIDATION RATE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {dashboard.overall_validation_rate}%
          </div>
          <div className="text-xs text-stone-500">Required fields completeness</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-warm-300 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>PUBLIC SOURCES</span>
            <Database className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{dashboard.total_sources}</div>
          <div className="text-xs text-stone-500">Distinct public domains</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-warm-300 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>STRUCTURED RECORDS</span>
            <Activity className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{dashboard.total_records}</div>
          <div className="text-xs text-stone-500">Normalized database resources</div>
        </div>
      </div>

      {/* Collector Table */}
      <div className="bg-white rounded-3xl border border-warm-300 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-warm-200 flex items-center justify-between bg-warm-50/60">
          <h3 className="text-sm font-bold text-stone-900">
            Bright Data Scraper Studio Collector Registry
          </h3>
          <span className="text-xs text-stone-500">Targeting Lucknow Public Infrastructure</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-warm-100 text-stone-600 border-b border-warm-200 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-3.5">Collector ID</th>
                <th className="px-6 py-3.5">Source & Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Validation Pass</th>
                <th className="px-6 py-3.5">Self-Heals</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200 text-stone-700">
              {dashboard.collectors.map((c) => {
                const isReal = REAL_COLLECTOR_IDS.has(c.collector_id);
                return (
                  <tr key={c.collector_id} className={`transition-colors ${isReal ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'hover:bg-warm-50/80'}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-rosewood-700 flex items-center gap-1.5 flex-wrap">
                        <span>{c.collector_id}</span>
                        {isReal && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                            Live Source
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900">{c.name}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 rounded-full bg-warm-100 text-stone-700 capitalize font-medium">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-stone-900 flex items-center gap-0.5 ml-1 text-brand-700 underline"
                        >
                          <span>source</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.last_run_at === null && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warm-100 text-stone-600 border border-warm-200 text-[11px] font-medium">
                          Not Run
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'healthy' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'degraded' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Degraded
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'healing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-medium">
                          <Wrench className="w-3.5 h-3.5 animate-spin" /> Healing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-warm-200 overflow-hidden">
                          <div
                            className={`h-full ${
                              c.validation_pass_rate >= 0.9
                                ? 'bg-emerald-600'
                                : c.validation_pass_rate >= 0.6
                                  ? 'bg-amber-600'
                                  : 'bg-rose-600'
                            }`}
                            style={{ width: `${c.validation_pass_rate * 100}%` }}
                          />
                        </div>
                        <span className="text-stone-800 font-semibold">{(c.validation_pass_rate * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {c.heal_count > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rosewood-700 border border-rose-200 font-bold text-xs">
                          {c.heal_count}x Healed
                        </span>
                      ) : (
                        <span className="text-stone-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRunCollector(c.collector_id)}
                        disabled={runningCollector === c.collector_id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warm-100 hover:bg-warm-200 text-stone-800 text-xs font-semibold border border-warm-300 transition-colors shadow-2xs"
                      >
                        <Play className={`w-3 h-3 ${runningCollector === c.collector_id ? 'animate-spin' : ''}`} />
                        <span>Run</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
