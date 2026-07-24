import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, X, ArrowRight, Loader2, Lock } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  requirePin = false,
}) => {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isCurrentlyOpen = Boolean(typeof isOpen === 'object' ? isOpen?.isOpen : isOpen);

  useEffect(() => {
    if (isCurrentlyOpen) {
      setStep(1);
      setPin('');
      setError('');
      setLoading(false);
    }
  }, [isCurrentlyOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    if (isCurrentlyOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCurrentlyOpen, onClose]);

  if (!isCurrentlyOpen) return null;

  const handleStep1Next = () => {
    setStep(2);
    setError('');
  };

  const handleFinalConfirm = async () => {
    if (requirePin && pin !== '1234') {
      setError('PIN must be 1234');
      return;
    }

    setLoading(true);
    try {
      if (onConfirm) await onConfirm();
      if (onClose) onClose();
    } catch (err) {
      setError(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const typeStyles = {
    danger: {
      bgIcon: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
      border: 'border-rose-500/30'
    },
    warning: {
      bgIcon: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
      border: 'border-amber-500/30'
    },
    info: {
      bgIcon: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
      border: 'border-indigo-500/30'
    }
  };

  const currentType = typeStyles[type] || typeStyles.warning;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`glass-panel w-full max-w-sm rounded-3xl p-5 border ${currentType.border} shadow-2xl space-y-4 cursor-default my-auto text-left animate-fade-in-scale`}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${currentType.bgIcon}`}>
              {type === 'danger' ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Step {step}/2 Verification
              </span>
              <h3 className="text-sm font-extrabold text-white leading-tight">{title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold text-center">
            {error}
          </div>
        )}

        {/* Step 1 View */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 font-medium leading-normal bg-slate-900/70 p-3 rounded-xl border border-slate-800">
              {description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleStep1Next}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition ${currentType.btn}`}
              >
                Next Step
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 View */}
        {step === 2 && (
          <div className="space-y-3">
            {requirePin ? (
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <label className="block text-slate-300 font-bold text-xs">
                  Enter Security PIN (1234)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="bg-transparent text-xs font-black tracking-widest text-white outline-none w-full"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 font-semibold bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                Confirm execution for <strong className="text-white">"{title}"</strong>?
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-200"
              >
                ← Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition ${currentType.btn}`}
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
