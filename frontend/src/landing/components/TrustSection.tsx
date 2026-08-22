import React from 'react';
import { ShieldCheck, History, Search } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-white border-y border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            We don't just list resources. <br className="hidden sm:block" />
            <span className="text-brand-700 italic font-normal">We prove them.</span>
          </h2>
          <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed">
            Most directories suffer from stale data and unverified claims. HerAccess is built differently. Every data point on our platform is tied to its original source.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified Provenance',
              desc: 'We never aggregate from aggregators. Data is extracted directly from authoritative sources—like hospital portals and government sites—with verbatim evidence excerpts stored for every claim.'
            },
            {
              icon: Search,
              title: 'Conflict Detection',
              desc: 'When two independent sources report different values for the same resource (e.g., conflicting curfew times), we don’t silently hide the discrepancy. We surface both values for you to see.'
            },
            {
              icon: History,
              title: 'Freshness Tracking',
              desc: 'Every displayed claim includes a timestamp. Data is color-coded by age, so you immediately know if a rent price was verified today or if it hasn’t been checked in a month.'
            }
          ].map((item, i) => (
            <div key={i} className="group p-10 rounded-3xl bg-warm-50 border border-warm-200 hover:bg-white hover:shadow-2xl hover:shadow-brand-900/5 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-warm-200 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <item.icon className="w-6 h-6 text-brand-700" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight relative z-10">{item.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed relative z-10 font-sans">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
