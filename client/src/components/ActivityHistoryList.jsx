import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  History, 
  Search, 
  User, 
  ArrowRight, 
  Clock, 
  Loader2, 
  Utensils, 
  Receipt, 
  Users, 
  CreditCard, 
  FileText, 
  Wrench,
  ArrowUpDown,
  Calendar
} from 'lucide-react';

export const ActivityHistoryList = () => {
  const { selectedMonth, user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  // Order: 'asc' (Old -> New, default as requested) or 'desc' (New -> Old)
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchLogs();
  }, [selectedMonth, sortOrder]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/activity-logs?month=${selectedMonth}&order=${sortOrder}`);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (entityName, actionType) => {
    if ((entityName || '').includes('Meal')) return Utensils;
    if ((entityName || '').includes('Expense')) return Receipt;
    if ((entityName || '').includes('Member') || (entityName || '').includes('Directory')) return Users;
    if ((entityName || '').includes('Deposit') || (actionType || '').includes('DEPOSIT')) return CreditCard;
    if ((entityName || '').includes('Maintenance')) return Wrench;
    return FileText;
  };

  const getEntityBadgeStyle = (entityName) => {
    if ((entityName || '').includes('Meal')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if ((entityName || '').includes('Expense')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    if ((entityName || '').includes('Member')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if ((entityName || '').includes('Deposit')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (log.description || '').toLowerCase().includes(query) ||
      (log.performedBy || '').toLowerCase().includes(query) ||
      (log.actionType || '').toLowerCase().includes(query) ||
      (log.oldValue || '').toLowerCase().includes(query) ||
      (log.newValue || '').toLowerCase().includes(query);

    const matchesEntity = filterEntity === 'all' || (log.entityName || '').toLowerCase().includes(filterEntity.toLowerCase());
    return matchesSearch && matchesEntity;
  });

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/30">
              Audit Trail
            </span>
            <span className="text-xs text-slate-400 font-semibold">{selectedMonth}</span>
          </div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-100 mt-1 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            Activity History & Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete timeline of all additions, updates, and changes stored chronologically with user tracking.
          </p>
        </div>

        {/* Sort Order Toggle */}
        <button
          onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-extrabold border border-slate-800 transition"
          title="Toggle timeline order"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400" />
          <span>Order: {sortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}</span>
        </button>
      </div>

      {/* Metric Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-bold">Total History Records</span>
          <span className="text-xl font-black text-white">{logs.length}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex justify-between items-center">
          <span className="text-xs text-indigo-300 font-bold">Filtered Results</span>
          <span className="text-xl font-black text-indigo-300">{filteredLogs.length}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex justify-between items-center">
          <span className="text-xs text-purple-300 font-bold">Timeline Sort Mode</span>
          <span className="text-xs font-black text-purple-300 uppercase">{sortOrder === 'asc' ? 'Old → New' : 'New → Old'}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 w-full sm:w-64">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search action or user..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-100 outline-none w-full placeholder-slate-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-bold mr-1">Filter:</span>
          {['all', 'Meal', 'Expense', 'Member', 'Deposit'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterEntity(cat)}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition ${
                filterEntity === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Log Timeline Feed */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-slate-800">
          <Clock className="h-8 w-8 mx-auto text-slate-500 mb-2" />
          No activity log records found for this filter or month ({selectedMonth}).
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => {
            const Icon = getEntityIcon(log.entityName, log.actionType);
            const badgeClass = getEntityBadgeStyle(log.entityName);
            const seqNum = sortOrder === 'asc' ? index + 1 : logs.length - index;

            return (
              <div 
                key={log._id || index}
                className="glass-card p-4 rounded-3xl border border-slate-800 space-y-2 hover:border-indigo-500/30 transition animate-fade-in-up hover-rise"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 font-mono">#{seqNum}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${badgeClass} flex items-center gap-1`}>
                      <Icon className="h-3 w-3" />
                      {log.entityName || 'Activity'}
                    </span>
                    <span className="text-xs font-extrabold text-white">{log.actionType}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                      <User className="h-3 w-3 text-indigo-400" />
                      By: <strong className="text-slate-200">{log.performedBy || 'System User'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {formatTimestamp(log.timestamp || log.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                  {log.description}
                </p>

                {/* Old Data -> New Data Diff Box */}
                {(log.oldValue !== 'N/A' || log.newValue !== 'N/A') && (
                  <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-rose-300/90 font-medium truncate max-w-full">
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] uppercase">
                        Old Data
                      </span>
                      <span className="truncate">{log.oldValue || 'None'}</span>
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0 hidden sm:block" />

                    <div className="flex items-center gap-1.5 text-emerald-300/90 font-medium truncate max-w-full">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] uppercase">
                        New Data
                      </span>
                      <span className="truncate">{log.newValue || 'Updated'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
