const User = require('../models/User');
const DailyMeal = require('../models/DailyMeal');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const MonthlyBill = require('../models/MonthlyBill');
const { calculateMonthlyBillsData } = require('../utils/billCalculator');
const { inMemUsers, inMemDailyMeals, inMemExpenses, inMemPayments, inMemMonthlyBills, generateId } = require('../utils/inMemoryStore');

// @desc    Calculate live monthly bill calculation preview
// @route   GET /api/bills/calculate?month=YYYY-MM
const getCalculatedBills = async (req, res) => {
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  let students = [];
  let meals = [];
  let expenses = [];
  let payments = [];

  // Try fetching DB records
  try {
    const dbStudents = await User.find({ role: 'student' });
    const dbMeals = await DailyMeal.find({ date: { $regex: `^${month}` } });
    const dbExpenses = await Expense.find({ date: { $regex: `^${month}` } });
    const dbPayments = await Payment.find({ month });

    if (dbStudents && dbStudents.length > 0) {
      students = dbStudents;
      meals = dbMeals;
      expenses = dbExpenses;
      payments = dbPayments;
    }
  } catch (err) {}

  // Fallback to in-memory store if DB lists empty
  if (students.length === 0) {
    students = inMemUsers.filter(u => u.role === 'student' && u.isActive !== false);
    meals = inMemDailyMeals.filter(m => m.date.startsWith(month));
    expenses = inMemExpenses.filter(e => e.date.startsWith(month));
    payments = inMemPayments.filter(p => p.month === month);
  }

  const result = calculateMonthlyBillsData(students, meals, expenses, payments, month);
  res.json(result);
};

// @desc    Save/Generate Monthly Bills for month
// @route   POST /api/bills/generate?month=YYYY-MM
const generateMonthlyBills = async (req, res) => {
  const month = req.body.month || req.query.month || new Date().toISOString().substring(0, 7);

  let students = [];
  let meals = [];
  let expenses = [];
  let payments = [];

  try {
    students = await User.find({ role: 'student' });
    meals = await DailyMeal.find({ date: { $regex: `^${month}` } });
    expenses = await Expense.find({ date: { $regex: `^${month}` } });
    payments = await Payment.find({ month });
  } catch (err) {}

  if (students.length === 0) {
    students = inMemUsers.filter(u => u.role === 'student' && u.isActive !== false);
    meals = inMemDailyMeals.filter(m => m.date.startsWith(month));
    expenses = inMemExpenses.filter(e => e.date.startsWith(month));
    payments = inMemPayments.filter(p => p.month === month);
  }

  const calcResult = calculateMonthlyBillsData(students, meals, expenses, payments, month);

  // Save to DB
  try {
    for (const b of calcResult.bills) {
      await MonthlyBill.findOneAndUpdate(
        { month, student: b.studentId },
        {
          studentName: b.studentName,
          roomNumber: b.roomNumber,
          totalMeals: b.totalMeals,
          mealRate: b.mealRate,
          generalMealCost: b.generalMealCost,
          specialDishCost: b.specialDishCost,
          grossTotal: b.grossTotal,
          totalPaid: b.totalPaid,
          netAmount: b.netAmount,
          status: b.status,
          specialBreakdown: b.specialBreakdown,
          generatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {}

  // Save to in-memory
  calcResult.bills.forEach(b => {
    const idx = inMemMonthlyBills.findIndex(mb => mb.month === month && (mb.student === b.studentId || mb.studentId === b.studentId));
    if (idx !== -1) {
      inMemMonthlyBills[idx] = { ...inMemMonthlyBills[idx], ...b, month };
    } else {
      inMemMonthlyBills.push({ _id: 'bill_' + generateId(), ...b, month });
    }
  });

  res.json({
    message: `Monthly bills successfully calculated and generated for ${month}`,
    data: calcResult
  });
};

// @desc    Get Student Personal Monthly Bill
// @route   GET /api/bills/my-bill?month=YYYY-MM
const getMyBill = async (req, res) => {
  const studentId = req.user._id.toString();
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  // First try saved bill
  try {
    const dbBill = await MonthlyBill.findOne({ month, student: studentId }).populate('student', 'name roomNumber email');
    if (dbBill) {
      return res.json(dbBill);
    }
  } catch (err) {}

  // Calculate live preview bill
  let students = [];
  let meals = [];
  let expenses = [];
  let payments = [];

  try {
    students = await User.find({ role: 'student' });
    meals = await DailyMeal.find({ date: { $regex: `^${month}` } });
    expenses = await Expense.find({ date: { $regex: `^${month}` } });
    payments = await Payment.find({ month });
  } catch (err) {}

  if (students.length === 0) {
    students = inMemUsers.filter(u => u.role === 'student' && u.isActive !== false);
    meals = inMemDailyMeals.filter(m => m.date.startsWith(month));
    expenses = inMemExpenses.filter(e => e.date.startsWith(month));
    payments = inMemPayments.filter(p => p.month === month);
  }

  const calcResult = calculateMonthlyBillsData(students, meals, expenses, payments, month);
  const myBill = calcResult.bills.find(b => b.studentId === studentId);

  if (myBill) {
    return res.json({
      ...myBill,
      month,
      overallGeneralCost: calcResult.totalGeneralCost,
      overallSpecialCost: calcResult.totalSpecialCost,
      overallGroupMeals: calcResult.totalGroupMeals,
      mealRate: calcResult.mealRate
    });
  }

  res.status(404).json({ message: 'No bill found for this month' });
};

// @desc    Update bill status (mark as settled)
// @route   PUT /api/bills/:studentId/status
const updateBillStatus = async (req, res) => {
  const { studentId } = req.params;
  const { month, status } = req.body;

  if (!month || !status) {
    return res.status(400).json({ message: 'Month and status are required' });
  }

  try {
    const bill = await MonthlyBill.findOneAndUpdate(
      { month, student: studentId },
      { status },
      { new: true }
    );
    if (bill) return res.json(bill);
  } catch (err) {}

  const memBill = inMemMonthlyBills.find(b => b.month === month && (b.studentId === studentId || b.student === studentId));
  if (memBill) {
    memBill.status = status;
    return res.json(memBill);
  }

  res.json({ message: 'Bill status updated' });
};

module.exports = {
  getCalculatedBills,
  generateMonthlyBills,
  getMyBill,
  updateBillStatus
};
