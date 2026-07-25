import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Wrench, RefreshCw, LogOut, Heart, Sparkles, Sun, Moon } from 'lucide-react';

export const MaintenanceScreen = () => {
  const { logout, theme, changeTheme, fetchMaintenanceStatus } = useContext(AuthContext);

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--bg-main,#0f172a)] text-[var(--text-main,#f8fafc)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"></div>

      {/* Theme Switcher Bar at Top Right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[var(--glass-bg,rgba(30,41,59,0.7))] p-1.5 rounded-2xl border border-[var(--glass-border,rgba(255,255,255,0.1))] shadow-lg">
        <button
          onClick={() => changeTheme('light')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition ${
            theme === 'light'
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Light Theme"
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" /> Light
        </button>

        <button
          onClick={() => changeTheme('midnight')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition ${
            theme === 'midnight'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Midnight Theme"
        >
          <Moon className="h-3.5 w-3.5 text-indigo-400" /> Midnight
        </button>

        <button
          onClick={() => changeTheme('dark')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition ${
            theme === 'dark'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Dark Theme"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Dark
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10 text-center space-y-6">
        {/* Animated Maintenance Icon */}
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 p-1 border border-amber-500/40 shadow-2xl mx-auto flex items-center justify-center">
            <Wrench className="h-12 w-12 text-amber-400 animate-bounce" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
            Scheduled Upgrade
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Temporary Pause
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight pt-1">
            System Under Maintenance
          </h1>
        </div>

        {/* Personal & Polite Message Card from Mohan */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3.5 text-xs text-slate-300 leading-relaxed font-medium text-center shadow-xl">
          <p className="text-sm font-extrabold text-slate-100 flex items-center justify-center gap-1.5">
            Hello & Welcome! 👋
          </p>
          <p className="text-slate-300">
            Hi, I'm <strong className="text-amber-400 font-bold">Mohan</strong>, creator and developer of MealHub. The site is currently undergoing scheduled maintenance by the Admin to upgrade system services and enhance your experience.
          </p>
          <p className="text-slate-300">
            We sincerely appreciate your patience and cooperation. Normal member dashboard access will be restored shortly!
          </p>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-400">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
            <span>Thank you for your understanding</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (fetchMaintenanceStatus) fetchMaintenanceStatus();
              window.location.reload();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 text-white" />
            Check Maintenance Status / Refresh
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-extrabold text-xs border border-rose-500/30 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out / Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
