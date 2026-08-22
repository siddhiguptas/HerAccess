import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  return (
    <section className="py-24 bg-rosewood-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">
          Ready to explore the network?
        </h2>
        <p className="text-lg text-rosewood-200 mb-10 max-w-2xl mx-auto">
          Access our live, verified map of safe accommodations, emergency healthcare, and public transit options in your new city.
        </p>
        <Link
          to="/app"
          className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-warm-50 text-rosewood-900 font-bold text-lg shadow-xl shadow-black/20 transition-transform hover:scale-105"
        >
          Open HerAccess
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="mt-6 text-sm text-rosewood-300 flex justify-center items-center gap-2">
          <MapPin className="w-4 h-4" />
          Currently supporting Lucknow, UP
        </p>
      </div>
    </section>
  );
};
