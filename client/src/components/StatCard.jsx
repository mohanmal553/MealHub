import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
    sky: 'from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-400',
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${colorMap[color] || colorMap.indigo} shadow-lg relative overflow-hidden animate-fade-in-up hover-rise hover-icon-bounce cursor-default transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs font-medium text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/60 border border-slate-700/50 shadow-inner icon-bounce transition-transform duration-200">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};
