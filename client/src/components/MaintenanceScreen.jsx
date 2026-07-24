import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Wrench, RefreshCw, LogOut, Heart, Sparkles } from 'lucide-react';

export const MaintenanceScreen = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 text-center space-y-6">
        {/* Animated Maintenance Icon */}
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 p-1 border border-amber-500/30 shadow-2xl mx-auto flex items-center justify-center">
            <Wrench className="h-12 w-12 text-amber-400 animate-bounce" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
            Scheduled Upgrade
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Temporary Pause
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight pt-1">
            Site Under Maintenance
          </h1>
        </div>

        {/* Personal & Polite Message Card from Mohan */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed font-medium text-center shadow-xl">
          <p className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5">
            Hello & Welcome! 👋
          </p>
          <p className="text-slate-300">
            Hi, I'm <strong className="text-amber-400 font-bold">Mohan</strong>, creator and developer of MealHub. The site is currently undergoing scheduled maintenance to upgrade system services and enhance your experience.
          </p>
          <p className="text-slate-300">
            We sincerely appreciate your patience and cooperation. Everything will be back online shortly!
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[11px] font-bold text-amber-300">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
            <span>Thank you for your understanding</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-slate-700 transition shadow-md"
          >
            <RefreshCw className="h-4 w-4 text-indigo-400" />
            Refresh Page
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-extrabold text-xs border border-rose-500/30 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out / Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
