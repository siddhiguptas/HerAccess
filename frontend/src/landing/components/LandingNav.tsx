import React from 'react';
import { Link } from 'react-router-dom';

export const LandingNav: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-warm-300/60 bg-[#FAF7F2]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 group-hover:scale-105 transition-transform flex-shrink-0">
            <img src="/logo.svg" alt="HerAccess Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-2xl text-stone-900 tracking-tight">
                Her<span className="text-rosewood-700 italic font-normal">Access</span>
              </span>
            </div>
          </div>
        </Link>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            to="/app"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rosewood-700 hover:bg-rosewood-800 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            Explore the Network
          </Link>
        </div>
      </div>
    </header>
  );
};
