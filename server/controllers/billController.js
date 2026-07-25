const User = require('../models/User');
const DailyMeal = require('../models/DailyMeal');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const MonthlyBill = require('../models/MonthlyBill');
const { calculateMonthlyBillsData } = require('../utils/billCalculator');

// @desc    Calculate live monthly bill calculation preview
// @route   GET /api/bills/calculate?month=YYYY-MM
const getCalculatedBills = async (req, res) => {
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const dbStudents = await User.find({ role: 'student' });
    const dbMeals = await DailyMeal.find({ date: { $regex: `^${month}` } });
    const dbExpenses = await Expense.find({ date: { $regex: `^${month}` } });
    const dbPayments = await Payment.find({ month });

    const result = calculateMonthlyBillsData(dbStudents || [], dbMeals || [], dbExpenses || [], dbPayments || [], month);
    return res.json(result);
  } catch (err) {
    console.error('Error calculating monthly bills:', err);
    return res.status(500).json({ message: 'Failed to calculate monthly bills from database' });
  }
};

// @desc    Save/Generate Monthly Bills for month
// @route   POST /api/bills/generate?month=YYYY-MM
const generateMonthlyBills = async (req, res) => {
  const month = req.body.month || req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const students = await User.find({ role: 'student' });
    const meals = await DailyMeal.find({ date: { $regex: `^${month}` } });
    const expenses = await Expense.find({ date: { $regex: `^${month}` } });
    const payments = await Payment.find({ month });

    const calcResult = calculateMonthlyBillsData(students || [], meals || [], expenses || [], payments || [], month);

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

    return res.json({
      message: `Monthly bills successfully calculated and saved for ${month}`,
      data: calcResult
    });
  } catch (err) {
    console.error('Error generating monthly bills:', err);
    return res.status(500).json({ message: 'Failed to generate monthly bills in database' });
  }
};

// @desc    Get Student Personal Monthly Bill
// @route   GET /api/bills/my-bill?month=YYYY-MM
const getMyBill = async (req, res) => {
  const studentId = req.user._id.toString();
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const dbBill = await MonthlyBill.findOne({ month, student: studentId }).populate('student', 'name roomNumber email');
    if (dbBill) {
      return res.json(dbBill);
    }

    const students = await User.find({ role: 'student' });
    const meals = await DailyMeal.find({ date: { $regex: `^${month}` } });
    const expenses = await Expense.find({ date: { $regex: `^${month}` } });
    const payments = await Payment.find({ month });

    const calcResult = calculateMonthlyBillsData(students || [], meals || [], expenses || [], payments || [], month);
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

    return res.status(404).json({ message: 'No bill statement found for this month' });
  } catch (err) {
    console.error('Error fetching personal bill statement:', err);
    return res.status(500).json({ message: 'Failed to fetch personal bill statement from database' });
  }
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
    return res.status(404).json({ message: 'Bill record not found for this member and month' });
  } catch (err) {
    console.error('Error updating bill status:', err);
    return res.status(500).json({ message: 'Failed to update bill status in database' });
  }
};

module.exports = {
  getCalculatedBills,
  generateMonthlyBills,
  getMyBill,
  updateBillStatus
};
