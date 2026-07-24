import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { AlertDialog } from './AlertDialog';
import { X, CreditCard } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, student, monthStr, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    amount: '',
    paymentMethod: 'UPI',
    note: 'Advance Mess Deposit'
  });

  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        note: `Mess advance payment by ${student.name}`
      }));
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payments', {
        date: formData.date,
        studentId: student._id || student.studentId,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        note: formData.note
      });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setAlertDialog({
        isOpen: true,
        title: 'Payment Record Failed',
        message: 'Failed to record mess deposit payment.',
        type: 'error'
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
        <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 animate-fade-in-scale">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-extrabold text-white">Record Mess Deposit / Payment</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500 font-bold uppercase">Student: </span>
            <span className="font-extrabold text-white">{student.name || student.studentName}</span>
            <span className="text-slate-400 ml-2">(Room {student.roomNumber || 'N/A'})</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="1500"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-emerald-500 font-black text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="UPI">GPay / PhonePe / UPI</option>
                  <option value="Cash">Cash Handover</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Payment Note</label>
              <input
                type="text"
                placeholder="e.g. Monthly advance mess money"
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-2xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
              >
                Save Deposit
              </button>
            </div>
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
    </>
  );
};
