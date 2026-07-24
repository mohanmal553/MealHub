import React, { useEffect } from 'react';
import { X, Printer, CheckCircle, AlertCircle, Utensils } from 'lucide-react';

export const BillBreakdownModal = ({ isOpen, onClose, bill, monthStr }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const isOwed = bill.netAmount > 0;
  const isRefund = bill.netAmount < 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-6 my-8 cursor-default print:border-none print:shadow-none print:bg-white print:text-black animate-fade-in-scale"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Official Bill Receipt
              </span>
              <span className="text-xs text-slate-400 font-medium">{monthStr || bill.month}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1 print:text-black">
              {bill.studentName || bill.student?.name}
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Room Number: <strong className="text-slate-200 print:text-black">{bill.roomNumber || 'N/A'}</strong> | Email: {bill.email || bill.student?.email}
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition"
            >
              <Printer className="h-4 w-4 text-indigo-400" />
              Print Invoice
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Meals</p>
            <p className="text-base font-extrabold text-white">{bill.totalMeals}</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Daily Rate</p>
            <p className="text-base font-extrabold text-emerald-400">₹{bill.mealRate}/meal</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">General Meal Cost</p>
            <p className="text-base font-extrabold text-indigo-300">₹{bill.generalMealCost}</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Special Dishes</p>
            <p className="text-base font-extrabold text-amber-300">₹{bill.specialDishCost}</p>
          </div>
        </div>

        {/* Special Dish Itemized Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-amber-400" />
            Itemized Special Dish Charges (Divided ONLY among ON members)
          </h4>

          {(!bill.specialBreakdown || bill.specialBreakdown.length === 0) ? (
            <div className="bg-slate-900/40 p-3 rounded-xl text-center text-xs text-slate-500 border border-slate-800">
              No special dish expenses incurred for days you had meals ON this month.
            </div>
          ) : (
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-700 font-semibold">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Special Dish Item</th>
                    <th className="p-2.5 text-right">Total Cost</th>
                    <th className="p-2.5 text-center">ON Members</th>
                    <th className="p-2.5 text-right font-bold text-amber-300">Your Split Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {bill.specialBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2.5 font-medium">{item.date}</td>
                      <td className="p-2.5 font-semibold text-slate-100">{item.itemName}</td>
                      <td className="p-2.5 text-right">₹{item.totalCost}</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">{item.onStudentCount} members</td>
                      <td className="p-2.5 text-right font-extrabold text-amber-300">₹{item.studentShare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Final Financial Summary */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>General Grocery Meal Total:</span>
            <span className="font-semibold text-slate-200">₹{bill.generalMealCost}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Special Dish Total Split:</span>
            <span className="font-semibold text-slate-200">₹{bill.specialDishCost}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-bold text-white">
            <span>Gross Total Bill:</span>
            <span>₹{bill.grossTotal}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span>Advance Payments / Deposits Made:</span>
            <span className="font-bold">- ₹{bill.totalPaid}</span>
          </div>

          <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${
            isOwed
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              {isOwed ? <AlertCircle className="h-5 w-5 text-amber-400" /> : <CheckCircle className="h-5 w-5 text-emerald-400" />}
              <div>
                <p className="font-bold text-xs">
                  {isOwed ? 'Net Balance Due / Owed to Group' : isRefund ? 'Net Refund Owed to Member' : 'Bill Completely Settled'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isOwed ? 'Please pay the balance to the hostel mess account.' : 'All expenses cleared.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black">₹{Math.abs(bill.netAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
