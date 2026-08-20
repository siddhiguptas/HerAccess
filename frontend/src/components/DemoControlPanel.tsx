import React, { useState, useEffect } from 'react';
import { DemoStatusResponse } from '../types';
import { api } from '../api';
import {
  Wrench, ShieldAlert, Sparkles, RefreshCw, CheckCircle2,
  AlertTriangle, Play, ChevronRight
} from 'lucide-react';

interface Props {
  onStateChanged?: () => void;
}

export const DemoControlPanel: React.FC<Props> = ({ onStateChanged }) => {
  const [status, setStatus] = useState<DemoStatusResponse | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [stepMsg, setStepMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await api.getDemoStatus();
      setStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSimulateBreak = async () => {
    try {
      setIsBusy(true);
      setStepMsg('Triggering layout change on target website...');
      const res = await api.triggerDemoBreak('c_hostel_sulekha_01');
      setStepMsg(res.message);
      await fetchStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setStepMsg(`Error: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleTriggerHeal = async () => {
    try {
      setIsBusy(true);
      setStepMsg('Invoking `bdata scraper heal c_hostel_sulekha_01` & approving fix...');
      const res = await api.triggerDemoHeal('c_hostel_sulekha_01');
      setStepMsg(res.message);
      await fetchStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setStepMsg(`Error: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsBusy(true);
      await api.resetDemo();
      setStepMsg('Demo reset. All collectors restored to healthy state.');
      await fetchStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setStepMsg(`Error: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  if (!status) return null;

  return (
    <div className="bg-slate-950/90 border border-brand-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-300">
                Self-Healing Architecture Demo (Simulated)
              </h3>
              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
                SIMULATION (ZERO CREDIT SPEND)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Demo Target: <span className="font-mono text-slate-200">c_hostel_sulekha_01</span> (Break ➔ Detect ➔ Formulate Heal ➔ Restore)
            </p>
          </div>
        </div>

        {/* Action Steps */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Step 1: Break */}
          <button
            onClick={handleSimulateBreak}
            disabled={isBusy || status.is_broken}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 border transition-all ${
              status.is_broken
                ? 'bg-rose-950/60 text-rose-300 border-rose-800 opacity-60 cursor-not-allowed'
                : 'bg-rose-900/80 hover:bg-rose-800 text-white border-rose-700 shadow-sm'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>1. Simulate Layout Break</span>
          </button>

          {/* Step 2: Heal */}
          <button
            onClick={handleTriggerHeal}
            disabled={isBusy || !status.is_broken}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 border transition-all ${
              !status.is_broken
                ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-brand-500 hover:bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-950 animate-pulse'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>2. Run `bdata scraper heal`</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={isBusy}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Reset demo state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time Demo Pipeline State Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs">
        <div
          className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
            !status.is_broken
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-slate-900/50 border-slate-800 text-slate-500'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div className="truncate">
            <span className="block font-bold">1. Healthy Extraction</span>
            <span className="text-[10px] opacity-80">3/3 required fields valid</span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
            status.is_broken
              ? 'bg-rose-950/60 border-rose-800 text-rose-300 ring-1 ring-rose-500/40'
              : 'bg-slate-900/50 border-slate-800 text-slate-500'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <div className="truncate">
            <span className="block font-bold">2. Validation Failure</span>
            <span className="text-[10px] opacity-80">0/3 fields valid (nulls detected)</span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
            !status.is_broken && status.last_healed_at
              ? 'bg-brand-950/60 border-brand-700 text-brand-300 ring-1 ring-brand-500/50'
              : 'bg-slate-900/50 border-slate-800 text-slate-500'
          }`}
        >
          <Wrench className="w-4 h-4 shrink-0" />
          <div className="truncate">
            <span className="block font-bold">3. Self-Healed & Recovered</span>
            <span className="text-[10px] opacity-80">Same Collector ID verified</span>
          </div>
        </div>
      </div>

      {stepMsg && (
        <div className="text-[11px] font-mono p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          👉 {stepMsg}
        </div>
      )}
    </div>
  );
};
