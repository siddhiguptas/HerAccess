import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Wrench, ShieldAlert, Sparkles, RefreshCw, CheckCircle2,
  AlertTriangle, Terminal, Zap, ShieldCheck, Database, ArrowRight, XCircle
} from 'lucide-react';

interface Props {
  onStateChanged?: () => void;
}

type PanelMode = 'real' | 'simulation';

export const DemoControlPanel: React.FC<Props> = ({ onStateChanged }) => {
  const [mode, setMode] = useState<PanelMode>('real');

  // Real Self-Healing State
  const [realStatus, setRealStatus] = useState<any>(null);
  const [isRealBusy, setIsRealBusy] = useState(false);
  const [realMsg, setRealMsg] = useState<string | null>(null);
  const [cliOutput, setCliOutput] = useState<string | null>(null);

  // Simulation State
  const [simStatus, setSimStatus] = useState<any>(null);
  const [isSimBusy, setIsSimBusy] = useState(false);
  const [simMsg, setSimMsg] = useState<string | null>(null);

  const fetchRealStatus = async () => {
    try {
      const data = await api.getRealHealStatus();
      setRealStatus(data);
      if (data.last_cli_output) {
        setCliOutput(data.last_cli_output);
      }
    } catch (err) {
      console.error('Error fetching real heal status:', err);
    }
  };

  const fetchSimStatus = async () => {
    try {
      const data = await api.getDemoStatus();
      setSimStatus(data);
    } catch (err) {
      console.error('Error fetching demo status:', err);
    }
  };

  useEffect(() => {
    fetchRealStatus();
    fetchSimStatus();
  }, []);

  // --- Real Workflow Handlers ---
  const handleRealTriggerBreak = async () => {
    try {
      setIsRealBusy(true);
      setRealMsg('Executing controlled schema failure injection on c_mt1f0ke713h6n32pi4...');
      const res = await api.triggerRealBreak('c_mt1f0ke713h6n32pi4');
      setRealMsg(res.message);
      await fetchRealStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setRealMsg(`Error: ${err.message}`);
    } finally {
      setIsRealBusy(false);
    }
  };

  const handleRealTriggerHeal = async () => {
    try {
      setIsRealBusy(true);
      setRealMsg('Executing `npx @brightdata/cli scraper heal c_mt1f0ke713h6n32pi4` and evaluating recovery...');
      const res = await api.triggerRealHeal(
        'c_mt1f0ke713h6n32pi4',
        'Layout altered on Kamla Girls Hostel target page. Fix selectors for monthly_price, curfew_time, and primary_contact.'
      );
      setRealMsg(res.message);
      if (res.cli_output) setCliOutput(res.cli_output);
      await fetchRealStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setRealMsg(`Error: ${err.message}`);
    } finally {
      setIsRealBusy(false);
    }
  };

  const handleRealReset = async () => {
    try {
      setIsRealBusy(true);
      await api.resetRealHeal('c_mt1f0ke713h6n32pi4');
      setRealMsg('Collector c_mt1f0ke713h6n32pi4 reset to healthy nominal state.');
      setCliOutput(null);
      await fetchRealStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setRealMsg(`Error: ${err.message}`);
    } finally {
      setIsRealBusy(false);
    }
  };

  // --- Simulation Workflow Handlers ---
  const handleSimBreak = async () => {
    try {
      setIsSimBusy(true);
      setSimMsg('Simulating source DOM layout mutation in zero-credit sandbox...');
      const res = await api.triggerDemoBreak('c_hostel_sulekha_01');
      setSimMsg(res.message);
      await fetchSimStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setSimMsg(`Error: ${err.message}`);
    } finally {
      setIsSimBusy(false);
    }
  };

  const handleSimHeal = async () => {
    try {
      setIsSimBusy(true);
      setSimMsg('Simulating recovery in zero-credit sandbox...');
      const res = await api.triggerDemoHeal('c_hostel_sulekha_01');
      setSimMsg(res.message);
      await fetchSimStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setSimMsg(`Error: ${err.message}`);
    } finally {
      setIsSimBusy(false);
    }
  };

  const handleSimReset = async () => {
    try {
      setIsSimBusy(true);
      await api.resetDemo();
      setSimMsg('Simulation state reset.');
      await fetchSimStatus();
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      setSimMsg(`Error: ${err.message}`);
    } finally {
      setIsSimBusy(false);
    }
  };

  return (
    <div className="bg-white border border-warm-300 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 font-sans">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-50 text-rosewood-700 border border-rose-200">
            <Zap className="w-5 h-5 text-brand-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">
                Self-Healing Scraper Architecture
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                mode === 'real'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-warm-100 text-stone-700 border-warm-200'
              }`}>
                {mode === 'real' ? '● Real Bright Data Engine' : '○ Simulated Sandbox (Zero-Credit)'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Automated resilience: DOM shift detection ➔ `bdata scraper heal` invocation ➔ Re-extraction ➔ Zero downstream code change
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-warm-100 border border-warm-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setMode('real')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              mode === 'real'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Real Bright Data Mode
          </button>
          <button
            onClick={() => setMode('simulation')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              mode === 'simulation'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Zero-Credit Demo Mode
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: REAL BRIGHT DATA SELF-HEALING */}
      {/* ========================================================================= */}
      {mode === 'real' && realStatus && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-warm-50/60 p-4 rounded-2xl border border-warm-200 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-stone-800">Target Collector:</span>
                <code className="px-2 py-0.5 rounded-md bg-white border border-warm-300 text-rosewood-700 font-mono text-[11px]">
                  {realStatus.collector_id}
                </code>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600 font-medium">Source: {realStatus.source_url}</span>
              </div>
              <div className="text-stone-500 text-[11px] flex items-center gap-2 flex-wrap">
                <span>Validation Score: <strong className={realStatus.is_failing ? 'text-rose-700' : 'text-emerald-700'}>{(realStatus.validation_score * 100).toFixed(0)}%</strong></span>
                <span>•</span>
                <span>Heal Count: {realStatus.heal_count}</span>
                {realStatus.last_healed_at && (
                  <>
                    <span>•</span>
                    <span>Last Healed: {new Date(realStatus.last_healed_at).toLocaleTimeString()}</span>
                  </>
                )}
                {realStatus.last_execution_duration_sec > 0 && (
                  <>
                    <span>•</span>
                    <span>CLI Duration: {realStatus.last_execution_duration_sec}s</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRealTriggerBreak}
                disabled={isRealBusy || realStatus.is_failing}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  realStatus.is_failing
                    ? 'bg-warm-100 text-stone-400 border-warm-200 cursor-not-allowed'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200 shadow-2xs'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                <span>1. Controlled Failure Injection</span>
              </button>

              <button
                onClick={handleRealTriggerHeal}
                disabled={isRealBusy || !realStatus.is_failing}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  !realStatus.is_failing
                    ? 'bg-warm-100 text-stone-400 border-warm-200 cursor-not-allowed'
                    : 'bg-rosewood-700 hover:bg-rosewood-800 text-white border-rosewood-800 shadow-sm animate-pulse'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>2. Run `bdata scraper heal`</span>
              </button>

              <button
                onClick={handleRealReset}
                disabled={isRealBusy}
                className="p-2.5 rounded-xl bg-white hover:bg-warm-100 text-stone-500 hover:text-stone-800 border border-warm-300 transition-colors"
                title="Reset collector"
              >
                <RefreshCw className={`w-4 h-4 ${isRealBusy ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Real Lifecycle Stages Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              !realStatus.is_failing && realStatus.last_run_status !== 'heal_failed'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-warm-50 border-warm-200 text-stone-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <div className="truncate">
                <span className="block font-bold">1. Nominal Validation</span>
                <span className="text-[11px] text-stone-500">100% schema verified</span>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              realStatus.is_failing
                ? 'bg-rose-50 border-rose-200 text-rose-950 ring-1 ring-rose-300'
                : 'bg-warm-50 border-warm-200 text-stone-400'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <div className="truncate">
                <span className="block font-bold">2. Schema Failure Injected</span>
                <span className="text-[11px] text-stone-500">
                  {realStatus.failed_fields?.length > 0
                    ? `Missing: ${realStatus.failed_fields.join(', ')}`
                    : 'CategoryValidator: 0% score'}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              realStatus.last_run_status === 'heal_failed'
                ? 'bg-rose-50 border-rose-200 text-rose-900 ring-1 ring-rose-400'
                : !realStatus.is_failing && realStatus.heal_count > 0
                  ? 'bg-rose-50 border-rose-200 text-rosewood-700 ring-1 ring-brand-300'
                  : 'bg-warm-50 border-warm-200 text-stone-400'
            }`}>
              {realStatus.last_run_status === 'heal_failed' ? (
                <XCircle className="w-4 h-4 shrink-0 text-rose-700" />
              ) : (
                <Wrench className="w-4 h-4 shrink-0 text-brand-700" />
              )}
              <div className="truncate">
                <span className="block font-bold">
                  {realStatus.last_run_status === 'heal_failed' ? '3. Heal Failed (Exit Code != 0)' : '3. Real Heal & Validation'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {realStatus.last_run_status === 'heal_failed' ? 'Error reported by CLI' : 'Same collector ID verified'}
                </span>
              </div>
            </div>
          </div>

          {realMsg && (
            <div className="text-xs p-3.5 rounded-2xl bg-warm-50 border border-warm-200 text-stone-800 font-medium flex items-start gap-2">
              <span className="text-brand-700 font-bold shrink-0">Status:</span>
              <span className="leading-relaxed">{realMsg}</span>
            </div>
          )}

          {cliOutput && (
            <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-200 text-xs font-mono space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800 pb-1">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Bright Data CLI Output ({realStatus.last_cli_returncode === 0 ? 'Exit Code 0' : `Exit Code ${realStatus.last_cli_returncode}`})
                </span>
                <span>Collector ID: {realStatus.collector_id}</span>
              </div>
              <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] leading-relaxed max-h-28">
                {cliOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SIMULATED SANDBOX (ZERO-CREDIT WALKTHROUGH) */}
      {/* ========================================================================= */}
      {mode === 'simulation' && simStatus && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900">Zero-Credit Demo Target:</span>
                <code className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 font-mono text-[11px]">
                  c_hostel_sulekha_01
                </code>
              </div>
              <p className="text-[11px] text-amber-800">
                Safe offline sandbox for evaluators to test UI reactivity without consuming API credits.
              </p>
            </div>

            {/* Action Steps */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSimBreak}
                disabled={isSimBusy || simStatus.is_broken}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  simStatus.is_broken
                    ? 'bg-amber-100 text-amber-400 border-amber-200 cursor-not-allowed'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-800" />
                <span>1. Simulate Layout Break</span>
              </button>

              <button
                onClick={handleSimHeal}
                disabled={isSimBusy || !simStatus.is_broken}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  !simStatus.is_broken
                    ? 'bg-warm-100 text-stone-400 border-warm-200 cursor-not-allowed'
                    : 'bg-brand-800 hover:bg-brand-900 text-white border-brand-900 shadow-sm animate-pulse'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>2. Simulate Heal Recovery</span>
              </button>

              <button
                onClick={handleSimReset}
                disabled={isSimBusy}
                className="p-2.5 rounded-xl bg-white hover:bg-warm-100 text-stone-500 hover:text-stone-800 border border-warm-300 transition-colors"
                title="Reset simulation"
              >
                <RefreshCw className={`w-4 h-4 ${isSimBusy ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Simulation Steps Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              !simStatus.is_broken
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-warm-50 border-warm-200 text-stone-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <div className="truncate">
                <span className="block font-bold">1. Healthy State</span>
                <span className="text-[11px] text-stone-500">Nominal sandbox</span>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              simStatus.is_broken
                ? 'bg-rose-50 border-rose-200 text-rose-950 ring-1 ring-rose-300'
                : 'bg-warm-50 border-warm-200 text-stone-400'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <div className="truncate">
                <span className="block font-bold">2. Layout Break Injected</span>
                <span className="text-[11px] text-stone-500">Simulated 0% validation</span>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              !simStatus.is_broken && simStatus.last_healed_at
                ? 'bg-rose-50 border-rose-200 text-rosewood-700 ring-1 ring-brand-300'
                : 'bg-warm-50 border-warm-200 text-stone-400'
            }`}>
              <Wrench className="w-4 h-4 shrink-0 text-brand-700" />
              <div className="truncate">
                <span className="block font-bold">3. Healed & Restored</span>
                <span className="text-[11px] text-stone-500">Same collector ID verified</span>
              </div>
            </div>
          </div>

          {simMsg && (
            <div className="text-xs p-3 rounded-xl bg-warm-50 border border-warm-200 text-stone-700 font-medium">
              👉 {simMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
