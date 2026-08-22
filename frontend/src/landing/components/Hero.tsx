import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, MapPin } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-24 pb-20 lg:pt-32 lg:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Copy Side */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100/80 text-rosewood-800 text-xs font-semibold mb-6 border border-rose-200">
              <Shield className="w-4 h-4 text-rosewood-600" />
              Verified Public Safety Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 leading-[1.1] mb-6">
              Relocate with confidence. <br />
              <span className="italic font-normal text-rosewood-700">Find a safer place to live.</span>
            </h1>
            <p className="text-lg text-stone-600 mb-8 max-w-xl leading-relaxed">
              A verified local access network for women. We directly scrape, cross-validate, and monitor accommodations, public transit, and emergency healthcare from primary sources—so you never have to trust an unverified directory again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/app"
                className="inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-full bg-rosewood-700 hover:bg-rosewood-800 text-white font-semibold text-lg shadow-lg shadow-rosewood-900/20 transition-all hover:scale-[1.02]"
              >
                Access the Network
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-stone-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Data Monitoring
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lucknow Coverage
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-[2rem] bg-white border border-warm-200 shadow-2xl overflow-hidden aspect-[4/3] md:aspect-[4/3] lg:aspect-[4/3]">
              {/* Replace with actual application preview composition or hero image */}
              <img 
                src="/hero-girl.png" 
                alt="Confident woman navigating the city" 
                className="w-full h-full object-cover object-top opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent mix-blend-multiply" />
              
              {/* Floating Verification Badge */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-warm-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">Source Verified</div>
                  <div className="text-xs text-stone-500">Cross-checked 2 hours ago via Bright Data</div>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-rose-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply" />
          </div>

        </div>
      </div>
    </section>
  );
};
