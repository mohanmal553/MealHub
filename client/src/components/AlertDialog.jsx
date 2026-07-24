import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const AlertDialog = ({
  isOpen,
  onClose,
  title = 'Notification',
  message = '',
  type = 'info'
}) => {
  const isCurrentlyOpen = Boolean(typeof isOpen === 'object' ? isOpen?.isOpen : isOpen);

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

  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      bgIcon: 'bg-emerald-500/20 border-emerald-500/30',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
      border: 'border-emerald-500/30'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      bgIcon: 'bg-rose-500/20 border-rose-500/30',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
      border: 'border-rose-500/30'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      bgIcon: 'bg-amber-500/20 border-amber-500/30',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
      border: 'border-amber-500/30'
    },
    info: {
      icon: Info,
      iconColor: 'text-indigo-400',
      bgIcon: 'bg-indigo-500/20 border-indigo-500/30',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
      border: 'border-indigo-500/30'
    }
  };

  const current = typeConfig[type] || typeConfig.info;
  const Icon = current.icon;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`glass-panel w-full max-w-sm rounded-3xl p-6 border ${current.border} shadow-2xl space-y-4 text-center cursor-default my-auto`}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border ${current.bgIcon} shadow-lg`}>
          <Icon className={`h-7 w-7 ${current.iconColor}`} />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white">{title}</h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">{message}</p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 rounded-2xl font-extrabold text-xs shadow-md transition ${current.btn}`}
          >
            OK / Close
          </button>
        </div>
      </div>
    </div>
  );
};
