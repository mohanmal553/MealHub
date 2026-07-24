import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { StatCard } from '../components/StatCard';
import { MealGrid } from '../components/MealGrid';
import { ExpenseList } from '../components/ExpenseList';
import { StudentList } from '../components/StudentList';
import { ActivityHistoryList } from '../components/ActivityHistoryList';
import { PaymentModal } from '../components/PaymentModal';
import { BillBreakdownModal } from '../components/BillBreakdownModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AlertDialog } from '../components/AlertDialog';
import { 
  Utensils, 
  Receipt, 
  Calculator, 
  CheckCircle, 
  Eye, 
  CreditCard, 
  RefreshCw, 
  Layers, 
  Loader2,
  TrendingUp
} from 'lucide-react';

export const AdminDashboard = ({ activeTab }) => {
  const { user, selectedMonth } = useContext(AuthContext);

  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Modals
  const [selectedStudentForDeposit, setSelectedStudentForDeposit] = useState(null);
  const [selectedBillForBreakdown, setSelectedBillForBreakdown] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchCalculatedBills();
  }, [selectedMonth]);

  const fetchCalculatedBills = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/bills/calculate?month=${selectedMonth}`);
      setBillData(res.data);
    } catch (err) {
      console.error('Failed to calculate bills:', err);
    } fontally: {
      setLoading(false);
    }
  };

  const handleOpenGenerateConfirm = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Generate & Freeze Monthly Bills (${selectedMonth})`,
      description: `This action will lock and finalize the computed general daily meal rate (₹${billData?.mealRate || 0}) and itemized special dish split costs for all members for ${selectedMonth}.`,
      confirmText: 'Generate & Save Monthly Bills',
      type: 'info',
      onConfirm: async () => {
        setGenerating(true);
        try {
          await API.post(`/bills/generate?month=${selectedMonth}`);
          await fetchCalculatedBills();
          setAlertDialog({
            isOpen: true,
            title: 'Bills Generated',
            message: `Monthly bill statements for ${selectedMonth} have been successfully computed and saved.`,
            type: 'success'
          });
        } catch (err) {
          setAlertDialog({
            isOpen: true,
            title: 'Generation Failed',
            message: 'Failed to generate monthly bills.',
            type: 'error'
          });
        } finally {
          setGenerating(false);
        }
      }
    });
  };

  const handleToggleStatus = (studentId, studentName, currentStatus) => {
    const nextStatus = currentStatus === 'settled' ? 'pending' : 'settled';
    setConfirmDialog({
      isOpen: true,
      title: `Update Bill Status (${studentName})`,
      description: `Change monthly bill status for ${studentName} from '${currentStatus}' to '${nextStatus}'?`,
      confirmText: `Mark as ${nextStatus.toUpperCase()}`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await API.put(`/bills/${studentId}/status`, {
            month: selectedMonth,
            status: nextStatus
          });
          fetchCalculatedBills();
          setAlertDialog({
            isOpen: true,
            title: 'Status Updated',
            message: `Bill status for ${studentName} updated to ${nextStatus}.`,
            type: 'success'
          });
        } catch (err) {
          setAlertDialog({
            isOpen: true,
            title: 'Update Failed',
            message: 'Failed to update bill status.',
            type: 'error'
          });
        }
      }
    });
  };

  if (activeTab === 'meals') return <MealGrid />;
  if (activeTab === 'expenses') return <ExpenseList />;
  if (activeTab === 'students') return <StudentList onDepositSuccess={fetchCalculatedBills} />;
  if (activeTab === 'history') return <ActivityHistoryList />;

  return (
    <div className="space-y-6">
      {/* Top High-level Metric StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Meals"
          value={billData?.totalGroupMeals || 0}
          subtext={`Total calculated meals for ${selectedMonth}`}
          icon={Utensils}
          color="emerald"
        />
        <StatCard
          title="Daily Meal Rate"
          value={`₹${billData?.mealRate || 0}`}
          subtext="General ration cost per meal"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="General Rations Cost"
          value={`₹${billData?.totalGeneralCost || 0}`}
          subtext="Common groceries split equally"
          icon={Receipt}
          color="sky"
        />
        <StatCard
          title="Special Dish Total"
          value={`₹${billData?.totalSpecialCost || 0}`}
          subtext="Shared ONLY among ON members"
          icon={Layers}
          color="amber"
        />
      </div>

      {/* Monthly Bills & Settler Table */}
      <div className="space-y-4">
        <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 animate-fade-in-scale">
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-400" />
              Monthly Bills Breakdown ({selectedMonth})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated bill calculation per hostel member based on daily meals and special dish participation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCalculatedBills}
              className="p-2 rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700"
              title="Recalculate"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenGenerateConfirm}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Generate & Freeze Monthly Bills
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : !billData?.bills || billData.bills.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 rounded-3xl border border-slate-800">
            No hostel members or meal records found for calculation.
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 font-extrabold uppercase text-[10px]">
                    <th className="p-3.5 whitespace-nowrap">Member Name</th>
                    <th className="p-3.5 text-center font-bold">Meals Eaten</th>
                    <th className="p-3.5 text-right font-bold">General Cost</th>
                    <th className="p-3.5 text-right font-bold">Special Dish Cost</th>
                    <th className="p-3.5 text-right font-bold">Gross Total</th>
                    <th className="p-3.5 text-right font-bold">Advance Paid</th>
                    <th className="p-3.5 text-right font-bold">Net Due / Refund</th>
                    <th className="p-3.5 text-center font-bold">Status</th>
                    <th className="p-3.5 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {billData.bills.map((b) => {
                    const isDue = b.netAmount > 0;
                    const isRef = b.netAmount < 0;

                    return (
                      <tr key={b.studentId} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-extrabold text-slate-100 whitespace-nowrap">
                          <div>{b.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">Room: {b.roomNumber || 'N/A'}</div>
                        </td>

                        <td className="p-3.5 text-center font-extrabold text-white whitespace-nowrap">
                          {b.totalMeals}
                        </td>

                        <td className="p-3.5 text-right font-bold text-slate-300 whitespace-nowrap">
                          ₹{b.generalMealCost}
                        </td>

                        <td className="p-3.5 text-right font-bold text-amber-300 whitespace-nowrap">
                          ₹{b.specialDishCost}
                        </td>

                        <td className="p-3.5 text-right font-black text-white whitespace-nowrap">
                          ₹{b.grossTotal}
                        </td>

                        <td className="p-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                          ₹{b.totalPaid}
                        </td>

                        <td className="p-3.5 text-right font-black whitespace-nowrap">
                          {isDue ? (
                            <span className="text-amber-400">₹{b.netAmount} (Due)</span>
                          ) : isRef ? (
                            <span className="text-emerald-400">₹{Math.abs(b.netAmount)} (Refund)</span>
                          ) : (
                            <span className="text-slate-400">₹0 (Cleared)</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(b.studentId, b.studentName, b.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border transition cursor-pointer ${
                              b.status === 'settled'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                            title="Click to toggle status (Settled / Pending)"
                          >
                            {b.status === 'settled' ? 'Settled' : 'Pending'}
                          </button>
                        </td>

                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedBillForBreakdown(b)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-bold border border-indigo-500/30 transition cursor-pointer shadow-xs"
                              title="View itemized bill statement"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Statement
                            </button>
                            <button
                              onClick={() => setSelectedStudentForDeposit({ _id: b.studentId, name: b.studentName, roomNumber: b.roomNumber })}
                              className="p-1.5 text-emerald-400 hover:text-emerald-200 transition cursor-pointer"
                              title="Record Payment / Deposit"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <BillBreakdownModal
        isOpen={!!selectedBillForBreakdown}
        onClose={() => setSelectedBillForBreakdown(null)}
        bill={selectedBillForBreakdown}
        monthStr={selectedMonth}
      />

      <PaymentModal
        isOpen={!!selectedStudentForDeposit}
        onClose={() => setSelectedStudentForDeposit(null)}
        student={selectedStudentForDeposit}
        monthStr={selectedMonth}
        onSuccess={fetchCalculatedBills}
      />

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
