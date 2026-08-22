import React, { useState, useEffect } from 'react';
import { RefreshCw, Code, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text, hasStarted]);

  return <span>{displayedText}</span>;
};

export const ReliabilitySection: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-stone-950 border-t border-stone-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 text-brand-400 text-xs font-semibold uppercase tracking-widest border border-stone-700/80 shadow-sm mb-8">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Resilient Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              Self-healing scrapers. <br />
              <span className="text-stone-400 font-sans font-light tracking-normal text-2xl sm:text-3xl">Because the web breaks.</span>
            </h2>
            <p className="text-stone-400 mb-10 text-base sm:text-lg leading-relaxed font-sans max-w-lg">
              When a target website changes its layout, traditional scrapers fail silently, leaving users with outdated or missing information. HerAccess detects structural failures instantly.
            </p>
            <ul className="space-y-6 mb-10">
              <li className="flex gap-4 items-start group">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <strong className="block text-stone-200 font-semibold mb-1">Detect</strong>
                  <span className="text-stone-400 text-sm">Schema validation catches missing or malformed fields.</span>
                </div>
              </li>
              <li className="flex gap-4 items-start group">
                <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500/20 transition-colors">
                  <Code className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <strong className="block text-stone-200 font-semibold mb-1">Heal</strong>
                  <span className="text-stone-400 text-sm">Dynamically invokes the Bright Data CLI to repair logic via AI.</span>
                </div>
              </li>
              <li className="flex gap-4 items-start group">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <strong className="block text-stone-200 font-semibold mb-1">Recover</strong>
                  <span className="text-stone-400 text-sm">Data flows resume automatically without changing downstream IDs.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="order-1 lg:order-2 bg-stone-900 rounded-[2rem] p-6 md:p-8 shadow-2xl font-mono text-sm sm:text-[15px] text-stone-300 relative overflow-hidden border border-stone-800 lg:scale-105 transform">
            <div className="absolute top-0 left-0 right-0 h-12 bg-stone-950 flex items-center px-6 border-b border-stone-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="mx-auto text-xs text-stone-500 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                heraccess-auto-repair
              </div>
            </div>
            
            <div className="pt-10 pb-4 space-y-3 leading-relaxed">
              <p className="text-rose-400">
                <span className="text-rose-500/50 mr-2">➜</span> 
                <TypewriterText text="ERROR: Field extraction failed for c_hostel_01" delay={500} />
              </p>
              <p className="text-stone-500">
                <TypewriterText text="Initiating self-healing sequence..." delay={1500} />
              </p>
              
              <div className="pl-4 border-l-2 border-stone-800 my-4 space-y-1">
                <p className="text-emerald-400">
                  <TypewriterText text="$ npx @brightdata/cli scraper heal \" delay={2500} />
                </p>
                <p className="text-emerald-400 ml-4">
                  <TypewriterText text="c_hostel_sulekha_01 \" delay={3500} />
                </p>
                <p className="text-emerald-400 ml-4">
                  <TypewriterText text='"Price and curfew fields missing" --json' delay={4000} />
                </p>
              </div>

              <p className="text-stone-400">
                <TypewriterText text="Analyzing DOM structure..." delay={5500} />
              </p>
              <p className="text-stone-400">
                <TypewriterText text="Generating new extraction rules..." delay={6500} />
              </p>
              <p className="text-stone-400">
                <TypewriterText text="Testing new selectors..." delay={7500} />
              </p>
              
              <p className="text-emerald-400 font-bold mt-6 flex items-center gap-2">
                <span className="text-emerald-500/50">✔</span> 
                <TypewriterText text="SUCCESS: Scraper healed. Extraction resumed." delay={8500} />
                <span className="animate-pulse w-2 h-4 bg-emerald-400 inline-block ml-1" style={{ animationDelay: '9s' }} />
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
