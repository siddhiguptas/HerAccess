import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 group">
            <div className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity">
              <img src="/logo.svg" alt="HerAccess Logo" className="w-full h-full object-contain transition-all" />
            </div>
            <span className="font-serif font-bold text-xl text-white tracking-tight">
              Her<span className="italic font-normal">Access</span>
            </span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium">
            <Link to="/app" className="hover:text-white transition-colors">Access Application</Link>
            <a href="https://github.com/siddhiguptas/HerAccess" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Source</a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-stone-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} HerAccess. Built for the Into the Scrape-Verse Hackathon.</p>
          <div className="flex items-center gap-2 text-stone-500">
            Powered by Bright Data
          </div>
        </div>
      </div>
    </footer>
  );
};
