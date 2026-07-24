import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { StatCard } from '../components/StatCard';
import { MealGrid } from '../components/MealGrid';
import { ExpenseList } from '../components/ExpenseList';
import { StudentList } from '../components/StudentList';
import { ActivityHistoryList } from '../components/ActivityHistoryList';
import { BillBreakdownModal } from '../components/BillBreakdownModal';
import { 
  Utensils, 
  Receipt, 
  CreditCard, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Loader2,
  Users,
  Calculator,
  Layers,
  Search
} from 'lucide-react';

export const StudentDashboard = ({ activeTab }) => {
  const { user, selectedMonth } = useContext(AuthContext);

  const [myBill, setMyBill] = useState(null);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedModalBill, setSelectedModalBill] = useState(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch personal bill data
      const myBillRes = await API.get(`/bills/my-bill?month=${selectedMonth}`);
      setMyBill(myBillRes.data);

      // 2. Fetch overall group calculation data (all members info)
      const groupBillRes = await API.get(`/bills/calculate?month=${selectedMonth}`);
      setBillData(groupBillRes.data);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (activeTab === 'meals') return <MealGrid />;
  if (activeTab === 'expenses') return <ExpenseList />;
  if (activeTab === 'students') return <StudentList />;
  if (activeTab === 'history') return <ActivityHistoryList />;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const isOwed = myBill?.netAmount > 0;
  const isRefund = myBill?.netAmount < 0;

  // Filter overall members bills
  const filteredMemberBills = (billData?.bills || []).filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      (b.studentName || '').toLowerCase().includes(q) ||
      (b.roomNumber || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. PERSONAL CONSUMED MEALS & INDIVIDUAL FINANCIAL SUMMARY */}
      {/* ============================================================ */}
      
      {/* Personal Welcome & Statement Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-fade-in-scale">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Welcome back, {user?.name}!
          </span>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-1">
            My Consumed Meals & Bill Statement ({selectedMonth})
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Hostel Room: <strong className="text-slate-200">{user?.roomNumber || 'N/A'}</strong> | Personal meal consumption, split cost breakdown, and advance mess deposit balance.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedModalBill(myBill);
            setIsBreakdownOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 transition cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          View My Detailed Statement
        </button>
      </div>

      {/* Personal Consumed Metric StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Meals Eaten"
          value={myBill?.totalMeals || 0}
          subtext={`Daily Rate: ₹${myBill?.mealRate || 0}/meal`}
          icon={Utensils}
          color="emerald"
        />
        <StatCard
          title="General Meal Cost"
          value={`₹${myBill?.generalMealCost || 0}`}
          subtext="Calculated via Daily Meal Rate"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Special Dish Share"
          value={`₹${myBill?.specialDishCost || 0}`}
          subtext="Split ONLY for days meal was ON"
          icon={Receipt}
          color="amber"
        />
        <StatCard
          title="Advance Paid"
          value={`₹${myBill?.totalPaid || 0}`}
          subtext="Mess deposit credited"
          icon={CreditCard}
          color="sky"
        />
      </div>

      {/* Net Payable Alert Banner */}
      {myBill && (
        <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 shadow-lg ${
          isOwed
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : isRefund
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-slate-800/80 border-slate-700 text-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isOwed ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {isOwed ? <AlertCircle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
            </div>
            <div>
              <h4 className="font-extrabold text-base">
                {isOwed
                  ? `Net Balance Owed: ₹${myBill.netAmount}`
                  : isRefund
                  ? `Refund Due: ₹${Math.abs(myBill.netAmount)}`
                  : 'Bill Completely Cleared & Settled!'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Gross Bill: ₹{myBill.grossTotal} | Less Advance Paid: ₹{myBill.totalPaid}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedModalBill(myBill);
              setIsBreakdownOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-xs font-bold text-white border border-slate-700 transition cursor-pointer"
          >
            Itemized Statement →
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. OVERALL HOSTEL MEMBER INFO & METRICS (ROOM SUMMARY) */}
      {/* ============================================================ */}
      
      <div className="space-y-4 pt-2">
        <div className="glass-panel p-4 rounded-3xl flex items-center justify-between border border-slate-800">
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-400" />
              Overall Hostel Summary & Rates ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Overall mess statistics across all active hostel roommates for the month.
            </p>
          </div>
        </div>

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
      </div>

      {/* ============================================================ */}
      {/* 3. OVERALL MEMBERS BILL STATEMENTS TABLE DIRECTORY */}
      {/* ============================================================ */}
      
      <div className="space-y-4 pt-2">
        {/* Table Header & Search */}
        <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              All Members Monthly Bill Directory ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete room member list with consumed meals, general split, special dish share, advance paid, and net due status.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700 w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search roommate name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-100 outline-none w-full placeholder-slate-500 font-medium"
            />
          </div>
        </div>

        {/* Member Statements Table */}
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
                {filteredMemberBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400 font-medium">
                      No member statement records found for {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  filteredMemberBills.map((b) => {
                    const isCurrentUser = b.studentId === user?._id || b.student?._id === user?._id;
                    const isDue = b.netAmount > 0;
                    const isRef = b.netAmount < 0;

                    return (
                      <tr 
                        key={b.studentId || b._id} 
                        className={`transition ${isCurrentUser ? 'bg-indigo-950/30 hover:bg-indigo-900/40 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="p-3.5 font-extrabold text-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{b.studentName || b.student?.name}</span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase border border-indigo-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Room: {b.roomNumber || 'N/A'}
                          </div>
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
                          {b.status === 'settled' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                              Settled
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedModalBill(b);
                              setIsBreakdownOpen(true);
                            }}
                            className="flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-bold border border-indigo-500/30 transition cursor-pointer shadow-xs"
                            title="View itemized bill statement"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Statement
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bill Breakdown Itemized Statement Modal */}
      <BillBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => {
          setIsBreakdownOpen(false);
          setSelectedModalBill(null);
        }}
        bill={selectedModalBill || myBill}
        monthStr={selectedMonth}
      />
    </div>
  );
};
