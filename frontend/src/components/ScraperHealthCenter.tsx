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
      <div className="p-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
        <span>Loading Scraper Health Center...</span>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono mb-2">
            <Activity className="w-3.5 h-3.5 text-brand-400" />
            <span>Judges Technical Dashboard</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Scraper Health & Provenance Center</h2>
          <p className="text-sm text-slate-400">
            Real-time status of Bright Data Scraper Studio collectors, validation pass rates, and self-healing events.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-brand-950/60 border border-brand-800 text-xs font-mono text-brand-300 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>COLLECTORS</span>
            <Globe className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{dashboard.total_collectors}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{dashboard.healthy_count} Healthy / {dashboard.failed_count} Issues</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>VALIDATION RATE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {dashboard.overall_validation_rate}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Required fields completeness</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PUBLIC SOURCES</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{dashboard.total_sources}</div>
          <div className="text-[11px] text-slate-400 font-mono">Distinct long-tail domains</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>STRUCTURED RECORDS</span>
            <Activity className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{dashboard.total_records}</div>
          <div className="text-[11px] text-slate-400 font-mono">Normalized database entities</div>
        </div>
      </div>

      {/* Collector Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Bright Data Scraper Studio Registry
          </h3>
          <span className="text-xs font-mono text-slate-400">Targeting Lucknow Public Infrastructure</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Collector ID</th>
                <th className="px-6 py-3">Source & Category</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Validation Pass</th>
                <th className="px-6 py-3">Heals</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {dashboard.collectors.map((c) => {
                const isReal = REAL_COLLECTOR_IDS.has(c.collector_id);
                return (
                  <tr key={c.collector_id} className={`transition-colors ${isReal ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-slate-850/50'}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-300 font-mono flex items-center gap-1.5 flex-wrap">
                        <span>{c.collector_id}</span>
                        {isReal && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[9px] font-bold">
                            REAL BRIGHT DATA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-sans font-medium text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 capitalize">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                        {isReal ? (
                          <span className="text-[10px] text-emerald-400 font-semibold">Live Source</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Reference Fixture Mode</span>
                        )}
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white flex items-center gap-0.5 ml-1"
                        >
                          <span>source</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.last_run_at === null && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-[11px]">
                          Not Run
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'healthy' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Healthy
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'degraded' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> Degraded
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[11px]">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                      {c.last_run_at !== null && c.status === 'healing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[11px]">
                          <Wrench className="w-3 h-3 animate-spin" /> Healing
                        </span>
                      )}
                    </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${
                            c.validation_pass_rate >= 0.9
                              ? 'bg-emerald-500'
                              : c.validation_pass_rate >= 0.6
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.validation_pass_rate * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-200">{(c.validation_pass_rate * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {c.heal_count > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-bold">
                        {c.heal_count}x Healed
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRunCollector(c.collector_id)}
                      disabled={runningCollector === c.collector_id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
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

      {/* Recent Collection Runs & Crawler Diagnostics */}
      {dashboard.recent_runs && dashboard.recent_runs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            <span>Recent Extraction Runs & Diagnostics</span>
          </h3>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Collector ID</th>
                  <th className="px-6 py-3.5">Triggered At</th>
                  <th className="px-6 py-3.5">Records Extracted</th>
                  <th className="px-6 py-3.5">Validation</th>
                  <th className="px-6 py-3.5">Diagnostics / Diagnostics Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dashboard.recent_runs.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{r.collector_id}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {r.triggered_at ? new Date(r.triggered_at).toLocaleTimeString() : 'Recent'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 font-bold">
                        {r.records_count} records
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {(r.validation_pass_rate * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-md truncate" title={r.error_summary || 'Clean run'}>
                      {r.error_summary ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{r.error_summary}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Clean run</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
