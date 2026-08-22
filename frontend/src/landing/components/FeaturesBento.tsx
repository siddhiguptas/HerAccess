import React from 'react';
import { Database, SearchCheck, Layers, GitCommit, Eye, ShieldCheck, Zap, Activity } from 'lucide-react';

export const FeaturesBento: React.FC = () => {
  return (
    <section id="features" className="py-24 sm:py-32 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-brand-700 text-xs font-semibold uppercase tracking-widest border border-rose-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            Designed for <span className="text-brand-700 italic font-normal">trust</span>. <br className="hidden sm:block" /> Built for scale.
          </h2>
          <p className="text-stone-600 font-sans max-w-2xl mx-auto text-sm sm:text-base">
            We don't rely on crowdsourced opinions. HerAccess is powered by an autonomous, self-healing pipeline that extracts and verifies raw infrastructure data.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          
          {/* Card 1: Large Feature */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-white border border-warm-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-warm-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-200/50 transition-colors duration-500" />
            
            <div className="relative h-full flex flex-col p-8 sm:p-10 z-10">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-50 transition-all duration-500">
                <Database className="w-6 h-6 text-brand-700" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">Primary Source Extraction</h3>
              <p className="text-stone-600 leading-relaxed font-sans max-w-md">
                Our collectors bypass third-party aggregators to pull rules, pricing, and infrastructure data directly from official domains and verified registries using Bright Data Web Scraper APIs.
              </p>
            </div>
          </div>

          {/* Card 2: Medium Feature */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-brand-900 border border-brand-800 shadow-sm hover:shadow-xl hover:shadow-brand-900/20 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-700/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-600/50 transition-colors duration-500" />
            
            <div className="relative h-full flex flex-col p-8 z-10 text-white">
              <div className="w-12 h-12 rounded-xl bg-brand-800/50 border border-brand-700/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-800 transition-all duration-500">
                <Activity className="w-6 h-6 text-rose-200" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Self-Healing Parsers</h3>
              <p className="text-brand-100 text-sm leading-relaxed font-sans">
                When a target website layout changes, the pipeline detects schema failure and instantly regenerates logic via AI without manual engineering.
              </p>
            </div>
          </div>

          {/* Card 3: Medium Feature */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-[2rem] bg-white border border-warm-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-tl from-warm-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative h-full flex flex-col p-8 z-10">
              <div className="w-12 h-12 rounded-xl bg-warm-100 border border-warm-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-warm-200 transition-all duration-500">
                <Layers className="w-6 h-6 text-stone-700" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 tracking-tight">Data Normalization</h3>
              <p className="text-stone-600 text-sm leading-relaxed font-sans">
                Unstructured facts are parsed into a strict schema, ensuring "women only" and "curfew" policies are mathematically comparable across all listings.
              </p>
            </div>
          </div>

          {/* Card 4: Large Feature */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-white border border-warm-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-warm-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 group-hover:bg-amber-200/40 transition-colors duration-500" />
            
            <div className="relative h-full flex flex-col p-8 sm:p-10 z-10 justify-end">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 mt-auto">
                <GitCommit className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">Geospatial Safety Meshing</h3>
              <p className="text-stone-600 leading-relaxed font-sans max-w-md">
                Every accommodation is cross-referenced with public transit grids, 24x7 hospitals, and police help desks to automatically calculate a holistic proximity safety network.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
