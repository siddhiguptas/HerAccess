import React from 'react';
import { ShieldCheck, History, Search } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-20 bg-white border-y border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">
            We don't just list resources. We prove them.
          </h2>
          <p className="text-stone-600">
            Most directories suffer from stale data and unverified claims. HerAccess is built differently. Every data point on our platform is tied to its original source.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-warm-50 border border-warm-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-rosewood-700" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">Verified Provenance</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              We never aggregate from aggregators. Data is extracted directly from authoritative sources—like hospital portals and government sites—with verbatim evidence excerpts stored for every claim.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-warm-50 border border-warm-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-rosewood-700" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">Conflict Detection</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              When two independent sources report different values for the same resource (e.g., conflicting curfew times), we don't silently hide the discrepancy. We surface both values for you to see.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-warm-50 border border-warm-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
              <History className="w-6 h-6 text-rosewood-700" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-3">Freshness Tracking</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Every displayed claim includes a timestamp. Data is color-coded by age, so you immediately know if a rent price was verified today or if it hasn't been checked in a month.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
