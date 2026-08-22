import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { MapPin, Radio, Loader2, CheckCircle2, XCircle, Database, ShieldCheck, Map, Sparkles } from 'lucide-react';

interface Props {
  locality: string;
  city: string;
  onExpansionComplete: () => void;
}

type JobStatus = 'idle' | 'pending' | 'collecting' | 'processing' | 'verifying' | 'completed' | 'failed';

const STAGES: { key: JobStatus; label: string; icon: React.ElementType }[] = [
  { key: 'pending', label: 'Request received', icon: Radio },
  { key: 'collecting', label: 'Connecting to Bright Data Scraper Studio', icon: Database },
  { key: 'processing', label: 'Processing fresh records', icon: Sparkles },
  { key: 'verifying', label: 'Verifying discovered resources', icon: ShieldCheck },
  { key: 'completed', label: 'Updating your safety map', icon: Map },
];

export const CoverageExpansionPanel: React.FC<Props> = ({ locality, city, onExpansionComplete }) => {
  const [status, setStatus] = useState<JobStatus>('idle');
  const [jobId, setJobId] = useState<number | null>(null);
  const [recordsFound, setRecordsFound] = useState(0);
  const [recordsAccepted, setRecordsAccepted] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<string>('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleExpand = async () => {
    try {
      setStatus('pending');
      setErrorMessage(null);
      const res = await api.expandCoverage(locality, city, 'women_hostel');
      if (res.error) {
        setStatus('failed');
        setErrorMessage(res.error);
        return;
      }
      setJobId(res.job_id);
      setMode(res.mode || '');
      setStatus(res.status as JobStatus);
    } catch (err: any) {
      setStatus('failed');
      setErrorMessage(err.message);
    }
  };

  // Poll job status
  useEffect(() => {
    if (!jobId) return;
    if (status === 'completed' || status === 'failed') return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.getCoverageJobStatus(jobId);
        setStatus(res.status as JobStatus);
        setRecordsFound(res.records_found || 0);
        setRecordsAccepted(res.records_accepted || 0);
        setMode(res.mode || '');

        if (res.status === 'completed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          // Short delay to let the user see the completed state
          setTimeout(() => onExpansionComplete(), 1500);
        }
        if (res.status === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setErrorMessage(res.error_message || 'Expansion failed');
        }
      } catch (err) {
        // Silently retry on poll failure
      }
    }, 1500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [jobId, status]);

  // Idle state: show coverage gap notice
  if (status === 'idle') {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-warm-300 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
          <MapPin className="w-7 h-7 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-stone-900 tracking-tight">
            Crafting custom results for you
          </h3>
          <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Hey! We don't have enough verified resources for <strong className="text-stone-900">{locality}, {city}</strong> yet, but we are crafting a custom result for you based on the area you searched.
            <br/><br/>
            Expand live coverage manually below, or just visit after some time once our automated systems populate this new area!
          </p>
        </div>
        <button
          onClick={handleExpand}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-semibold text-sm shadow-md shadow-brand-900/20 transition-all hover:scale-105 cursor-pointer"
        >
          <Radio className="w-4 h-4" />
          <span>Expand Live Coverage</span>
        </button>
        <p className="text-xs text-stone-400">
          Powered by Bright Data Scraper Studio
        </p>
      </div>
    );
  }

  // Active / completed / failed states: show progress stepper
  const currentStageIndex = STAGES.findIndex(s => s.key === status);

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-warm-300 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-900 tracking-tight">
            {status === 'completed' ? 'Coverage expanded' : status === 'failed' ? 'Expansion failed' : 'Expanding live coverage'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            {locality}, {city}
            {mode && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                mode === 'live'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-warm-100 text-stone-600 border-warm-200'
              }`}>
                {mode === 'live' ? '● Live Bright Data' : '○ Demo Mode'}
              </span>
            )}
          </p>
        </div>
        {status === 'completed' && (
          <div className="text-right">
            <p className="text-2xl font-bold text-stone-900">{recordsAccepted}</p>
            <p className="text-xs text-stone-500">resources verified</p>
          </div>
        )}
      </div>

      {/* Stage stepper */}
      <div className="space-y-3">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = stage.key === status;
          const isDone = i < currentStageIndex || status === 'completed';
          const isPending = i > currentStageIndex && status !== 'completed' && status !== 'failed';
          const isFailed = status === 'failed' && isActive;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all duration-500 ${
                isFailed
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : isDone
                    ? 'bg-emerald-50/50 border-emerald-200/50 text-emerald-900'
                    : isActive
                      ? 'bg-brand-50 border-brand-200 text-brand-900 shadow-sm'
                      : 'bg-warm-50/50 border-warm-200/50 text-stone-400'
              }`}
            >
              <div className="shrink-0">
                {isFailed ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-brand-700 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-warm-300" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                isDone ? 'text-emerald-800' : isActive ? 'text-brand-800 font-semibold' : 'text-stone-400'
              }`}>
                {stage.label}
              </span>
              {isActive && !isFailed && stage.key === 'processing' && recordsFound > 0 && (
                <span className="ml-auto text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                  {recordsFound} records
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {status === 'failed' && errorMessage && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {errorMessage}
        </p>
      )}

      {/* Completion summary */}
      {status === 'completed' && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-900">
            <strong>{recordsFound}</strong> public records collected, <strong>{recordsAccepted}</strong> passed verification and are now on your map.
          </p>
        </div>
      )}
    </div>
  );
};
