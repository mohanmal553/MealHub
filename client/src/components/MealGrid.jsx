import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { Calendar, UserCheck, ToggleLeft, Loader2 } from 'lucide-react';

export const MealGrid = () => {
  const { selectedMonth, user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Compute number of days in selectedMonth
  const [year, monthNum] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return day < 10 ? `0${day}` : `${day}`;
  });

  // Get local date string YYYY-MM-DD
  const getTodayLocalStr = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Safe helper to normalize date string to YYYY-MM-DD
  const normalizeDateStr = (d) => {
    if (!d) return '';
    const str = typeof d === 'string' ? d : new Date(d).toISOString();
    return str.substring(0, 10);
  };

  // Safe helper to reliably compare student IDs
  const isSameStudentId = (idA, idB) => {
    if (!idA || !idB) return false;
    const rawA = typeof idA === 'object' ? (idA._id || idA) : idA;
    const rawB = typeof idB === 'object' ? (idB._id || idB) : idB;
    return String(rawA) === String(rawB);
  };

  // Check if a meal is ON for a given date
  const isMealOn = (meal, dateStr) => {
    const todayStr = getTodayLocalStr();
    // Upcoming (future) dates are locked and cannot be active yet
    if (dateStr && dateStr > todayStr) {
      return false;
    }
    if (!meal) return true; // Default to ON for past/current days if no explicit record
    return (meal.status || '').toUpperCase() === 'ON';
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, mlRes] = await Promise.all([
        API.get('/students'),
        API.get(`/meals?month=${selectedMonth}`)
      ]);
      setStudents(stRes.data);
      setMeals(mlRes.data);
    } catch (err) {
      console.error('Error fetching meal grid data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMealForDay = (studentId, dayStr) => {
    const targetDate = `${selectedMonth}-${dayStr}`;
    return meals.find(
      m => normalizeDateStr(m.date) === targetDate && isSameStudentId(m.student, studentId)
    );
  };

  const handleToggle = async (studentId, dayStr) => {
    if (!user) return;

    const dateStr = `${selectedMonth}-${dayStr}`;
    const todayStr = getTodayLocalStr();

    // Prevent toggling meal status for upcoming (future) dates
    if (dateStr > todayStr) return;

    const currentMeal = getMealForDay(studentId, dayStr);
    
    const isCurrentlyOn = isMealOn(currentMeal, dateStr);
    const nextStatus = isCurrentlyOn ? 'OFF' : 'ON';
    const nextCount = nextStatus === 'ON' ? 1 : 0;

    const cellId = `${studentId}_${dayStr}`;
    setSavingId(cellId);

    // Optimistic UI state update
    setMeals(prev => {
      const filtered = prev.filter(m => !(normalizeDateStr(m.date) === dateStr && isSameStudentId(m.student, studentId)));
      return [...filtered, { date: dateStr, student: studentId, status: nextStatus, mealCount: nextCount }];
    });

    try {
      const res = await API.post('/meals/toggle', {
        date: dateStr,
        studentId,
        status: nextStatus,
        mealCount: nextCount
      });

      // Update state with server returned record
      setMeals(prev => {
        const filtered = prev.filter(m => !(normalizeDateStr(m.date) === dateStr && isSameStudentId(m.student, studentId)));
        return [...filtered, res.data];
      });
    } catch (err) {
      console.error('Failed to update meal status:', err);
      fetchData(); // Revert on error
    } finally {
      setSavingId(null);
    }
  };

  const handleConfirmBulkToggle = (statusToSet) => {
    if (!user) return;

    const todayStr = getTodayLocalStr();
    const dateToUse = todayStr.startsWith(selectedMonth) ? todayStr : `${selectedMonth}-01`;

    setConfirmDialog({
      isOpen: true,
      title: `Mark Meal ${statusToSet} for Everyone`,
      description: `This action will set meal status to '${statusToSet}' for all active members on ${dateToUse}.`,
      confirmText: `Set Everyone to ${statusToSet}`,
      type: statusToSet === 'ON' ? 'info' : 'warning',
      onConfirm: async () => {
        const updates = students.map(st => ({
          studentId: st._id,
          status: statusToSet,
          mealCount: statusToSet === 'ON' ? 1 : 0
        }));

        // Optimistic UI state update for all members on dateToUse
        setMeals(prev => {
          const filtered = prev.filter(m => normalizeDateStr(m.date) !== dateToUse);
          const newMealRecords = students.map(st => ({
            date: dateToUse,
            student: st._id,
            status: statusToSet,
            mealCount: statusToSet === 'ON' ? 1 : 0
          }));
          return [...filtered, ...newMealRecords];
        });

        try {
          await API.post('/meals/bulk-toggle', {
            date: dateToUse,
            mealUpdates: updates
          });
          await fetchData();
          setAlertDialog({
            isOpen: true,
            title: `Meals Set to ${statusToSet}`,
            message: `Meal status on ${dateToUse} has been updated to ${statusToSet} for all members.`,
            type: 'success'
          });
        } catch (err) {
          fetchData();
          setAlertDialog({
            isOpen: true,
            title: 'Update Failed',
            message: 'Bulk meal status update failed.',
            type: 'error'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            Daily Meal Status Matrix ({selectedMonth})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tap cell to toggle ON (1) / OFF (0) status per member. (Upcoming dates are locked)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleConfirmBulkToggle('ON')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/30 transition shadow-sm"
            title="Mark Meal ON for Everyone"
          >
            <UserCheck className="h-3.5 w-3.5" /> Mark All ON
          </button>
          <button
            onClick={() => handleConfirmBulkToggle('OFF')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30 transition shadow-sm"
            title="Mark Meal OFF for Everyone"
          >
            <ToggleLeft className="h-3.5 w-3.5" /> Mark All OFF
          </button>
        </div>
      </div>

      {/* Identical Responsive Matrix Table for Mobile and Desktop */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <th className="p-3 sticky left-0 z-20 bg-slate-900 min-w-[140px] font-extrabold text-slate-200 border-r border-slate-800 shadow-md">
                  Member Name
                </th>
                {daysArray.map(dayStr => {
                  const dateStr = `${selectedMonth}-${dayStr}`;
                  const todayStr = getTodayLocalStr();
                  const isToday = dateStr === todayStr;
                  const isUpcoming = dateStr > todayStr;

                  return (
                    <th 
                      key={dayStr} 
                      className={`p-2 text-center min-w-[36px] font-bold border-l border-slate-800/50 ${
                        isToday 
                          ? 'bg-indigo-600/30 text-indigo-300 font-black' 
                          : isUpcoming 
                          ? 'text-slate-600 bg-slate-950/60' 
                          : ''
                      }`}
                      title={isToday ? 'Today' : isUpcoming ? 'Upcoming date (Locked)' : `Day ${dayStr}`}
                    >
                      {dayStr}
                    </th>
                  );
                })}
                <th className="p-3 text-center min-w-[70px] font-extrabold text-emerald-400 border-l border-slate-800 bg-slate-900">
                  Total ON
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={daysArray.length + 2} className="p-6 text-center text-slate-400 font-medium">
                    No members registered yet. Go to Members Directory to add roommates.
                  </td>
                </tr>
              ) : (
                students.map(st => {
                  let totalOnDays = 0;
                  const todayStr = getTodayLocalStr();

                  return (
                    <tr key={st._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 sticky left-0 z-10 bg-slate-900/95 font-bold text-slate-100 border-r border-slate-800 shadow-md">
                        <div className="truncate max-w-[130px]">{st.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">Room: {st.roomNumber || 'N/A'}</div>
                      </td>

                      {daysArray.map(dayStr => {
                        const dateStr = `${selectedMonth}-${dayStr}`;
                        const isUpcoming = dateStr > todayStr;
                        const meal = getMealForDay(st._id, dayStr);
                        const isOn = isMealOn(meal, dateStr);
                        if (isOn) totalOnDays++;

                        const cellId = `${st._id}_${dayStr}`;
                        const isSaving = savingId === cellId;
                        const canToggle = !!user && !isUpcoming;

                        return (
                          <td
                            key={dayStr}
                            onClick={() => canToggle && handleToggle(st._id, dayStr)}
                            className={`p-1 text-center border-l border-slate-800/50 transition select-none ${
                              isUpcoming
                                ? 'opacity-30 cursor-not-allowed bg-slate-950/40'
                                : canToggle
                                ? 'cursor-pointer hover:bg-slate-700/50'
                                : ''
                            }`}
                            title={
                              isUpcoming
                                ? `${st.name} - Day ${dayStr}: Upcoming date (Locked)`
                                : `${st.name} - Day ${dayStr}: ${isOn ? 'ON' : 'OFF'}`
                            }
                          >
                            <div
                              className={`mx-auto flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black transition-all transform active:scale-75 hover:scale-110 duration-200 ${
                                isUpcoming
                                  ? 'bg-slate-800/40 text-slate-500 border border-slate-700/30'
                                  : isOn
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
                              }`}
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin text-slate-300" />
                              ) : isUpcoming ? (
                                '-'
                              ) : isOn ? (
                                '1'
                              ) : (
                                '0'
                              )}
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center font-extrabold text-emerald-400 bg-slate-900/60 border-l border-slate-800">
                        {totalOnDays}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Step Verification & Alert Dialogs */}
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
    </div>
  );
};
