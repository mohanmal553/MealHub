import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AlertDialog } from '../components/AlertDialog';
import { UtensilsCrossed, ArrowRight, Eye, EyeOff, Wrench, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const { login, isMaintenanceMode, fetchMaintenanceStatus } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Re-check maintenance mode status right before login
      await fetchMaintenanceStatus();

      const uData = await login(email, password);

      if (isMaintenanceMode && uData.role !== 'admin') {
        setAlertDialog({
          isOpen: true,
          title: 'System Under Maintenance 🛠️',
          message: `Hello ${uData.name || 'Member'}, the system is currently under scheduled maintenance by the Admin. You will be redirected to the Maintenance Screen.`,
          type: 'warning'
        });
      } else {
        setAlertDialog({
          isOpen: true,
          title: 'Login Successful! 🎉',
          message: `Welcome back, ${uData.name || 'User'}! You have successfully signed in to MealHub.`,
          type: 'success'
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Check email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-midnight-theme min-h-[100dvh] bg-gradient-to-br from-[#090d16] via-[#0f172a] to-[#131b2e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Ambient Midnight Glow Elements */}
      <div className="absolute top-1/4 left-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[28rem] w-[28rem] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 right-1/3 h-72 w-72 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* App Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30 mb-2">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">MealHub</h1>
          <p className="text-xs text-slate-400 font-medium">Hostel Member Meal & Grocery Expense Management</p>
        </div>

        {/* Maintenance Banner if Maintenance Mode is active */}
        {isMaintenanceMode && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-pulse">
            <Wrench className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-extrabold text-amber-300">System Maintenance Mode Active</div>
              <div className="text-[11px] text-amber-200/80 font-normal">
                App is undergoing scheduled updates. Regular member dashboard access is paused. (Admin access enabled)
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="Enter registered email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-3 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to MealHub'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};
