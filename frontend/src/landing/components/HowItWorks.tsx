import React from 'react';
import { Database, GitCommit, SearchCheck, Layers, Eye } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">
            The Intelligence Pipeline
          </h2>
          <p className="text-stone-600">
            How we turn fragmented public web pages into a structured, highly-reliable safety network.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Only visible on lg screens) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-warm-200" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-warm-200 shadow-sm flex items-center justify-center mb-6 relative z-10 transition-transform hover:-translate-y-1">
                <Database className="w-10 h-10 text-brand-700" />
              </div>
              <h4 className="font-bold text-stone-900 mb-2">1. Discover</h4>
              <p className="text-xs text-stone-500 max-w-[200px]">Identify official sources and directories across the city.</p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-warm-200 shadow-sm flex items-center justify-center mb-6 relative z-10 transition-transform hover:-translate-y-1">
                <SearchCheck className="w-10 h-10 text-brand-700" />
              </div>
              <h4 className="font-bold text-stone-900 mb-2">2. Extract</h4>
              <p className="text-xs text-stone-500 max-w-[200px]">Pull unstructured data using Bright Data collectors.</p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center sm:col-span-2 lg:col-span-1">
              <div className="w-24 h-24 rounded-2xl bg-white border border-warm-200 shadow-sm flex items-center justify-center mb-6 relative z-10 transition-transform hover:-translate-y-1">
                <Layers className="w-10 h-10 text-brand-700" />
              </div>
              <h4 className="font-bold text-stone-900 mb-2">3. Normalize</h4>
              <p className="text-xs text-stone-500 max-w-[200px]">Standardize prices, hours, and addresses into schemas.</p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-warm-200 shadow-sm flex items-center justify-center mb-6 relative z-10 transition-transform hover:-translate-y-1">
                <GitCommit className="w-10 h-10 text-brand-700" />
              </div>
              <h4 className="font-bold text-stone-900 mb-2">4. Mesh</h4>
              <p className="text-xs text-stone-500 max-w-[200px]">Compute spatial proximity to hospitals and transit.</p>
            </div>

            {/* Step 5 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-warm-200 shadow-sm flex items-center justify-center mb-6 relative z-10 bg-brand-50 border-brand-200 transition-transform hover:-translate-y-1">
                <Eye className="w-10 h-10 text-brand-700" />
              </div>
              <h4 className="font-bold text-stone-900 mb-2">5. Deliver</h4>
              <p className="text-xs text-stone-500 max-w-[200px]">Serve ranked, transparent results to the frontend.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
