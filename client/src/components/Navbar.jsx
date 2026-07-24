import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  LogOut, 
  Shield, 
  Clock,
  Wrench,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { 
    user, 
    logout, 
    isMaintenanceMode, 
    toggleMaintenanceMode,
    theme,
    changeTheme
  } = useContext(AuthContext);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Real-time H:M:S live clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const handleOpenMaintenanceConfirm = () => {
    const nextState = !isMaintenanceMode;
    setConfirmDialog({
      isOpen: true,
      title: nextState ? 'Turn Maintenance ON?' : 'Turn Maintenance OFF?',
      description: nextState
        ? 'This will pause access for non-admin members.'
        : 'This will restore normal member access.',
      confirmText: nextState ? 'Enable' : 'Disable',
      type: nextState ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          await toggleMaintenanceMode(nextState);
          setAlertDialog({
            isOpen: true,
            title: 'Maintenance Updated',
            message: `Maintenance Mode is now ${nextState ? 'ON' : 'OFF'}.`,
            type: 'success'
          });
        } catch (err) {
          setAlertDialog({
            isOpen: true,
            title: 'Update Failed',
            message: 'Failed to update maintenance mode status.',
            type: 'error'
          });
        }
      }
    });
  };

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-2.5 md:px-6 py-2.5 shadow-2xl backdrop-blur-xl bg-slate-950/80 w-full flex-none">
      <div className="w-full flex items-center justify-between gap-2">
        
        {/* Brand Logo - Clickable on Mobile to Toggle Menu */}
        <div 
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          className="flex items-center gap-2 cursor-pointer select-none group"
          title="Click to toggle menu"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-xl font-black tracking-tight text-white flex items-center gap-1">
              MealHub
              <span className="text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v1.0
              </span>
              {/* Mobile Toggle Chevron Indicator */}
              <span className="md:hidden text-indigo-400 ml-0.5">
                {isMobileMenuOpen ? <ChevronUp className="h-3.5 w-3.5 inline" /> : <ChevronDown className="h-3.5 w-3.5 inline" />}
              </span>
            </h1>
            <p className="text-[9px] text-slate-400 font-medium">Hostel Member Expense Splitter</p>
          </div>
        </div>

        {/* Center Live Date & Real-Time H:M:S Clock */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 shadow-inner">
          <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-pulse" />
          <div className="text-left leading-none">
            <div className="text-[10px] md:text-xs font-black text-white font-mono tracking-tight">
              {formattedTime}
            </div>
            <div className="text-[8px] font-semibold text-slate-400">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Desktop Controls: Theme Switcher, Maintenance Toggle, Profile & Logout */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 text-slate-200 hover:text-white text-xs font-extrabold border border-slate-800 transition shadow-xs cursor-pointer hover:border-slate-700"
              title="Select Theme (Light, Midnight, Dark)"
            >
              {theme === 'light' && <Sun className="h-3.5 w-3.5 text-amber-400" />}
              {theme === 'midnight' && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
              {theme === 'dark' && <Sparkles className="h-3.5 w-3.5 text-purple-400" />}
              <span className="capitalize text-[10px] md:text-xs">{theme}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-36 glass-panel rounded-2xl p-1.5 border border-slate-800 shadow-2xl z-50 flex flex-col gap-1">
                <button
                  onClick={() => {
                    changeTheme('light');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    theme === 'light'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5 text-amber-400" /> Light
                  </span>
                  {theme === 'light' && <span className="text-[10px]">✓</span>}
                </button>

                <button
                  onClick={() => {
                    changeTheme('midnight');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    theme === 'midnight'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5 text-indigo-400" /> Midnight
                  </span>
                  {theme === 'midnight' && <span className="text-[10px]">✓</span>}
                </button>

                <button
                  onClick={() => {
                    changeTheme('dark');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Dark
                  </span>
                  {theme === 'dark' && <span className="text-[10px]">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Admin Maintenance Mode Toggle Button */}
          {user?.role === 'admin' && (
            <button
              onClick={handleOpenMaintenanceConfirm}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition border shadow-xs ${
                isMaintenanceMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title="Toggle Maintenance Mode"
            >
              <Wrench className={`h-3 w-3 ${isMaintenanceMode ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Maintenance: {isMaintenanceMode ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded-xl border border-slate-800">
            <div className="flex h-5 w-5 items-center justify-center rounded-md font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Shield className="h-3 w-3" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-slate-100">{user?.name}</div>
              <div className="text-[8px] font-black uppercase tracking-wider text-slate-400">{user?.email}</div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-xl bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition border border-rose-500/20"
            title="Log out"
          >
            <LogOut className="h-3 w-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel (shown when clicking logo on mobile view) */}
      {isMobileMenuOpen && (
        <div className="w-full md:hidden pt-2.5 mt-2 border-t border-slate-800/80 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Theme Selector Segmented Control */}
          <div className="flex items-center justify-between bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 pl-2">Theme:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeTheme('light')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                  theme === 'light' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
                }`}
              >
                <Sun className="h-3 w-3" /> Light
              </button>
              <button
                onClick={() => changeTheme('midnight')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                  theme === 'midnight' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400'
                }`}
              >
                <Moon className="h-3 w-3" /> Midnight
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                  theme === 'dark' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'
                }`}
              >
                <Sparkles className="h-3 w-3" /> Dark
              </button>
            </div>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => {
                handleOpenMaintenanceConfirm();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-extrabold transition border ${
                isMaintenanceMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Wrench className={`h-4 w-4 ${isMaintenanceMode ? 'text-amber-400' : 'text-slate-400'}`} />
                Maintenance Mode
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold">
                {isMaintenanceMode ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="text-left leading-tight min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100 truncate">{user?.name}</div>
              <div className="text-[10px] font-medium text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition border border-rose-500/30 text-xs font-extrabold"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* 2-Step Verification Dialog & AlertDialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </header>
  );
};
