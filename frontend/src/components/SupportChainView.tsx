import React from 'react';
import { SupportChainItem, ResourceCategory } from '../types';
import { Train, Stethoscope, Pill, Shield, HeartHandshake, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  chain: SupportChainItem[];
  hostelName: string;
}

export const SupportChainView: React.FC<Props> = ({ chain, hostelName }) => {
  const getCategoryTheme = (category: ResourceCategory) => {
    switch (category) {
      case 'public_transport':
        return { icon: Train, text: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', title: 'Metro Transit' };
      case 'hospital':
        return { icon: Stethoscope, text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', title: 'Emergency Healthcare' };
      case 'pharmacy':
        return { icon: Pill, text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', title: '24x7 Pharmacy' };
      case 'police_or_public_support':
        return { icon: Shield, text: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', title: 'Women Police Desk' };
      case 'women_support':
      default:
        return { icon: HeartHandshake, text: 'text-rosewood-700', bg: 'bg-rose-50 border-rose-200', title: 'Crisis Support & 1090' };
    }
  };

  if (!chain || chain.length === 0) return null;

  return (
    <div className="bg-warm-50 rounded-2xl p-5 sm:p-6 border border-warm-300 space-y-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-700" />
            <span>Local Safety & Support Mesh</span>
          </h4>
          <p className="text-xs text-stone-600 mt-0.5">
            Verifiable public safety infrastructure surrounding <span className="font-semibold text-stone-800">{hostelName}</span>
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-warm-200 text-stone-700 border border-warm-300">
          5-Point Mesh Active
        </span>
      </div>

      <div className="space-y-2.5">
        {chain.map((item, idx) => {
          const { icon: Icon, text, bg, title } = getCategoryTheme(item.category);
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${bg} transition-all hover:shadow-2xs bg-white`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-warm-50 ${text} border border-warm-200 shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-stone-900">{item.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warm-100 text-stone-600 border border-warm-200">
                      {title}
                    </span>
                    {item.is_real_data ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Verified Primary Source
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warm-100 text-stone-500 border border-warm-200">
                        Reference Data
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 font-sans">{item.key_detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right shrink-0">
                <span className="text-xs sm:text-sm font-bold text-stone-800">
                  {item.distance_km.toFixed(1)} km
                </span>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-warm-100 transition-colors"
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
