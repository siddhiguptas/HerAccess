import React from 'react';
import { RefreshCw, Code, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ReliabilitySection: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-6 border border-brand-200">
              <RefreshCw className="w-4 h-4" />
              Resilient Infrastructure
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-6 leading-tight">
              Self-healing scrapers. <br /> Because the web breaks.
            </h2>
            <p className="text-stone-600 mb-8 text-lg leading-relaxed">
              When a target website changes its layout, traditional scrapers fail silently, leaving users with outdated or missing information. HerAccess detects structural failures instantly.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <span className="text-stone-700"><strong>Detect:</strong> Schema validation catches missing or malformed fields.</span>
              </li>
              <li className="flex gap-3">
                <Code className="w-6 h-6 text-brand-600 flex-shrink-0" />
                <span className="text-stone-700"><strong>Heal:</strong> Dynamically invokes the Bright Data CLI to repair the extractor logic.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <span className="text-stone-700"><strong>Recover:</strong> Data flows resume automatically without changing downstream IDs.</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900 rounded-3xl p-6 md:p-8 shadow-2xl font-mono text-sm text-stone-300 relative overflow-hidden border border-stone-800">
            <div className="absolute top-0 left-0 right-0 h-10 bg-stone-950 flex items-center px-4 border-b border-stone-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="mx-auto text-xs text-stone-500">Terminal</div>
            </div>
            <div className="pt-8">
              <p className="text-rose-400 mb-2">ERROR: Field extraction failed for c_hostel_sulekha_01</p>
              <p className="mb-4 text-stone-500">Initiating self-healing sequence...</p>
              <p className="text-emerald-400 mb-2">$ npx @brightdata/cli scraper heal \</p>
              <p className="text-emerald-400 ml-4 mb-2">c_hostel_sulekha_01 \</p>
              <p className="text-emerald-400 ml-4 mb-4">"Price and curfew fields missing after site update" --json</p>
              <p className="mb-2 text-stone-400">Analyzing DOM structure...</p>
              <p className="mb-2 text-stone-400">Generating new extraction rules...</p>
              <p className="mb-2 text-stone-400">Testing new selectors...</p>
              <p className="text-emerald-500 font-bold mt-4">SUCCESS: Scraper healed. Extraction resumed.</p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
