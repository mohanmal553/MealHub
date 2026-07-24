import React, { useState } from 'react';
import { Lock, ArrowRight, Shield, AlertCircle } from 'lucide-react';

export const ReAuthModal = ({ isOpen, user, onUnlock, onLogout }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password === 'admin123') {
        setPassword('');
        onUnlock();
      } else {
        setError('Invalid password. Enter admin123');
      }
    } catch (err) {
      setError('Re-authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 text-center relative overflow-hidden">
        {/* Top Glow Orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"></div>

        {/* Lock Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-xl">
          <Lock className="h-8 w-8 text-indigo-400" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            Session Locked Security
          </span>
          <h3 className="text-xl font-extrabold text-white">Browser Tab Switch Detected</h3>
          <p className="text-xs text-slate-300 font-medium">
            Please enter your password to unlock <strong className="text-white">{user?.name || 'MealHub Admin'}</strong>'s session.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter password (admin123)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-center text-sm font-bold text-white outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="w-1/2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition"
            >
              Logout Account
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
            >
              Unlock Session <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
