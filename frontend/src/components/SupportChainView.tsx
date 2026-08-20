import React from 'react';
import { SupportChainItem, ResourceCategory } from '../types';
import { Train, Stethoscope, Pill, Shield, HeartHandshake, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  chain: SupportChainItem[];
  hostelName: string;
}

export const SupportChainView: React.FC<Props> = ({ chain, hostelName }) => {
  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case 'public_transport':
        return { icon: Train, color: 'text-sky-400', bg: 'bg-sky-950/60 border-sky-800/60', title: 'Public Transport' };
      case 'hospital':
        return { icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800/60', title: 'Healthcare' };
      case 'pharmacy':
        return { icon: Pill, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60', title: '24x7 Pharmacy' };
      case 'police_or_public_support':
        return { icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border-indigo-800/60', title: 'Police / Helpdesk' };
      case 'women_support':
      default:
        return { icon: HeartHandshake, color: 'text-brand-400', bg: 'bg-brand-950/60 border-brand-800/60', title: 'Support Resource' };
    }
  };

  if (!chain || chain.length === 0) return null;

  return (
    <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Local Support Ecosystem Chain
          </h4>
          <p className="text-[11px] text-slate-400">
            Immediate verifiable facilities surrounding {hostelName}
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
          5-Point Mesh
        </span>
      </div>

      <div className="space-y-2.5">
        {chain.map((item, idx) => {
          const { icon: Icon, color, bg, title } = getCategoryIcon(item.category);
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl border ${bg} transition-all hover:bg-slate-900`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color} bg-slate-900/80`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-white">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {title}
                    </span>
                    {item.is_real_data ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        REAL BRIGHT DATA
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                        REFERENCE FIXTURE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.key_detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <span className="text-xs font-mono font-semibold text-slate-200">
                  {item.distance_km.toFixed(1)} km
                </span>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="View public source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
