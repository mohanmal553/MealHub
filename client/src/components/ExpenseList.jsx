import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';
import { Plus, Edit2, Trash2, Tag, Search, AlertCircle, X, Loader2 } from 'lucide-react';

export const ExpenseList = () => {
  const { selectedMonth, user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    itemName: '',
    category: 'general',
    cost: '',
    paidBy: '',
    paidByName: '',
    notes: ''
  });

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchExpensesAndStudents();
  }, [selectedMonth]);

  const fetchExpensesAndStudents = async () => {
    setLoading(true);
    try {
      const [expRes, stRes] = await Promise.all([
        API.get(`/expenses?month=${selectedMonth}`),
        API.get('/students')
      ]);
      setExpenses(expRes.data);
      setStudents(stRes.data);
    } catch (err) {
      console.error('Failed to fetch expenses or members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exp = null) => {
    const candidateMembers = students.filter(s => s.role !== 'admin');
    const firstCandidate = candidateMembers[0];

    if (exp) {
      setEditingExpense(exp);
      setFormData({
        date: exp.date,
        itemName: exp.itemName,
        category: exp.category,
        cost: exp.cost,
        paidBy: exp.paidBy?._id || exp.paidBy || (firstCandidate?._id || ''),
        paidByName: exp.paidByName || exp.paidBy?.name || (firstCandidate?.name || ''),
        notes: exp.notes || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().substring(0, 10),
        itemName: '',
        category: 'general',
        cost: '',
        paidBy: firstCandidate?._id || '',
        paidByName: firstCandidate?.name || '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleMemberSelectChange = (e) => {
    const selectedVal = e.target.value;
    if (!selectedVal) {
      setFormData(prev => ({
        ...prev,
        paidBy: '',
        paidByName: ''
      }));
    } else {
      const [mId, mName] = selectedVal.split('|');
      setFormData(prev => ({
        ...prev,
        paidBy: mId,
        paidByName: mName
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await API.put(`/expenses/${editingExpense._id}`, formData);
      } else {
        await API.post('/expenses', formData);
      }
      setIsModalOpen(false);
      fetchExpensesAndStudents();
      setAlertDialog({
        isOpen: true,
        title: 'Expense Saved',
        message: 'Market grocery expense record has been successfully logged.',
        type: 'success'
      });
    } catch (err) {
      setAlertDialog({
        isOpen: true,
        title: 'Save Failed',
        message: 'Failed to save market expense.',
        type: 'error'
      });
    }
  };

  const handleConfirmDelete = (exp) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Expense (${exp.itemName})`,
      description: `Warning: Deleting the expense '${exp.itemName}' (₹${exp.cost}) will recalculate all group daily meal rates and special dish split costs for ${selectedMonth}.`,
      confirmText: 'Permanently Delete Expense',
      type: 'danger',
      onConfirm: async () => {
        try {
          await API.delete(`/expenses/${exp._id}`);
          fetchExpensesAndStudents();
          setAlertDialog({
            isOpen: true,
            title: 'Expense Deleted',
            message: `Expense '${exp.itemName}' has been removed.`,
            type: 'success'
          });
        } catch (err) {
          setAlertDialog({
            isOpen: true,
            title: 'Delete Failed',
            message: 'Failed to delete expense record.',
            type: 'error'
          });
        }
      }
    });
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.paidByName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || e.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const totalGeneral = expenses.filter(e => e.category === 'general').reduce((sum, e) => sum + Number(e.cost), 0);
  const totalSpecial = expenses.filter(e => e.category === 'special').reduce((sum, e) => sum + Number(e.cost), 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-400" />
            Market Expense Log ({selectedMonth})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log all common rations and special dish purchases for exact bill calculation.
          </p>
        </div>

        {user && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition"
          >
            <Plus className="h-4 w-4" />
            Log Market Expense
          </button>
        )}
      </div>

      {/* Metric Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-bold">Total Expenses Logged</span>
          <span className="text-xl font-black text-white">₹{totalGeneral + totalSpecial}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center">
          <span className="text-xs text-emerald-300 font-bold">General Rations</span>
          <span className="text-xl font-black text-emerald-300">₹{totalGeneral}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex justify-between items-center">
          <span className="text-xs text-amber-300 font-bold">Special Dishes</span>
          <span className="text-xl font-black text-amber-300">₹{totalSpecial}</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 w-full sm:w-64">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search item or buyer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-100 outline-none w-full placeholder-slate-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-bold mr-1">Filter:</span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition ${filterCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory('general')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition ${filterCategory === 'general' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            General
          </button>
          <button
            onClick={() => setFilterCategory('special')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition ${filterCategory === 'special' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Special
          </button>
        </div>
      </div>

      {/* Content Rendering - Identical Responsive Table for All Viewports */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-slate-800">
          <AlertCircle className="h-8 w-8 mx-auto text-slate-500 mb-2" />
          No expense records found for this month. Click <strong>"Log Market Expense"</strong> to add a grocery item.
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 font-extrabold uppercase text-[10px]">
                  <th className="p-3.5 whitespace-nowrap">Date</th>
                  <th className="p-3.5 font-bold">Item Purchased</th>
                  <th className="p-3.5 font-bold">Category / Split Type</th>
                  <th className="p-3.5 font-bold">Paid By (Member)</th>
                  <th className="p-3.5 text-right font-bold">Cost (₹)</th>
                  <th className="p-3.5 font-bold">Notes</th>
                  {user && <th className="p-3.5 text-center font-bold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 whitespace-nowrap font-bold text-slate-300">{exp.date}</td>
                    <td className="p-3.5 font-extrabold text-slate-100 min-w-[120px]">{exp.itemName}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      {exp.category === 'special' ? (
                        <span className="badge-special px-3 py-1 rounded-full text-[10px] font-black">
                          🍖 Special Dish (ON members only)
                        </span>
                      ) : (
                        <span className="badge-general px-3 py-1 rounded-full text-[10px] font-black">
                          🥬 General Grocery (Common)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-slate-300 whitespace-nowrap">{exp.paidByName || exp.paidBy?.name || 'Member'}</td>
                    <td className="p-3.5 text-right font-black text-white text-sm whitespace-nowrap">₹{exp.cost}</td>
                    <td className="p-3.5 text-slate-400 max-w-[200px] truncate">{exp.notes || '-'}</td>
                    {user && (
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(exp)}
                            className="p-1.5 text-indigo-400 hover:text-indigo-200 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(exp)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 cursor-default my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">
                {editingExpense ? 'Edit Market Expense' : 'Log New Expense'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rice 25kg, Mutton Curry, Cooking Oil"
                  value={formData.itemName}
                  onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category Type</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="general">🥬 General Grocery</option>
                    <option value="special">🍖 Special Dish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-black text-sm"
                  />
                </div>
              </div>

              {/* Paid By / Buyer Dropdown strictly selecting non-admin system members */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Paid By (System Member)</label>
                <select
                  required
                  value={formData.paidBy ? `${formData.paidBy}|${formData.paidByName}` : ''}
                  onChange={handleMemberSelectChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="">-- Select Member Who Paid --</option>
                  {students.filter(st => st.role !== 'admin').map(st => (
                    <option key={st._id} value={`${st._id}|${st.name}`}>
                      {st.name} (Room {st.roomNumber || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Notes / Description</label>
                <textarea
                  rows="2"
                  placeholder="Optional notes or purchase details..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold hover:from-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
