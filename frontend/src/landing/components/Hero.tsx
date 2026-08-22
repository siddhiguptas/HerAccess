import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, MapPin, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-20 md:pt-28 pb-24 lg:pt-36 lg:pb-32">
      {/* Premium ambient background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200/50 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/60 blur-[120px] rounded-full mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Copy Side */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-brand-800 text-xs font-bold uppercase tracking-widest mb-8 border border-brand-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Intelligence Network
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-serif font-bold tracking-tight text-stone-900 leading-[1.1] mb-8">
              Relocate with confidence. <br />
              <span className="italic font-normal text-brand-700">Find a safer place.</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 mb-10 max-w-xl leading-relaxed font-sans">
              A verified local access network for women. We directly scrape, cross-validate, and monitor accommodations, public transit, and emergency healthcare from primary sources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/app"
                className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-brand-800 hover:bg-brand-900 text-white font-semibold text-lg shadow-xl shadow-brand-900/20 transition-all hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Access the Network</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm font-semibold text-stone-500 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Live Data Monitoring
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                Lucknow Coverage
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-[2.5rem] bg-white border border-warm-200 shadow-2xl shadow-brand-900/10 overflow-hidden aspect-[4/3] group">
              <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-700 z-10" />
              <img 
                src="/hero-girl.png" 
                alt="Confident woman navigating the city" 
                className="w-full h-full object-cover object-top opacity-95 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent mix-blend-multiply z-10" />
              
              {/* Floating Verification Badge */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4 hover:-translate-y-2 transition-transform duration-500 z-20 group-hover:shadow-brand-900/20">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <Shield className="w-7 h-7 text-emerald-600 relative z-10" />
                  <div className="absolute inset-0 bg-emerald-200/50 translate-y-full group-hover:-translate-y-0 transition-transform duration-500 ease-out" />
                </div>
                <div>
                  <div className="text-base font-bold text-stone-900 tracking-tight">Source Verified</div>
                  <div className="text-xs text-stone-500 font-medium mt-0.5">Cross-checked 2 hours ago via Bright Data</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
