import React, { useEffect } from 'react';
import { X, Code2, Mail, Sparkles, Heart, Utensils } from 'lucide-react';

export const AboutDeveloperModal = ({ isOpen, onClose }) => {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-6 relative overflow-hidden cursor-default"
      >
        {/* Glow background effects */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"></div>

        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition z-20"
          aria-label="Close Modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Developer Header Profile */}
        <div className="text-center space-y-3 pt-2 relative z-10">
          <div className="relative inline-block">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-1 shadow-xl shadow-indigo-500/30 mx-auto">
              <div className="h-full w-full bg-slate-950 rounded-[22px] flex items-center justify-center text-2xl font-black text-white">
                M
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-xl shadow-md" title="Verified Software Developer">
              <Code2 className="h-4 w-4 stroke-[3]" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Mohan</h2>
            <p className="text-xs font-bold text-indigo-400 flex items-center justify-center gap-1.5 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Software Developer
            </p>
          </div>

          <a
            href="mailto:mohanmal553@gmail.com"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-200 hover:border-indigo-500 hover:text-indigo-300 transition"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            mohanmal553@gmail.com
          </a>
        </div>

        {/* Meaningful Developer Quote */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative z-10 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
            <Heart className="h-3 w-3 fill-amber-400" /> Developer Quote
          </p>
          <blockquote className="text-xs italic text-slate-300 font-medium leading-relaxed">
            "Crafting elegant, high-performance web applications that solve real-world problems with precision, clarity, and passion."
          </blockquote>
        </div>

        {/* About MealHub App Section */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2 relative z-10">
          <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
            <Utensils className="h-4 w-4 text-emerald-400" />
            About MealHub Application
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            MealHub is an intelligent, automated hostel & roommate meal expense management system. It simplifies daily meal status tracking, market grocery expense logging, and itemized monthly bill calculation with exact split rules for general groceries and special dish meals.
          </p>
        </div>

        {/* Footer & Explicit Close Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 relative z-10">
          <span className="text-[11px] text-slate-400 font-bold truncate">
            Design & Develop by <strong className="text-white">Mohan</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
