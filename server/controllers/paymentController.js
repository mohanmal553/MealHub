const Payment = require('../models/Payment');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get payments/deposits for a month
// @route   GET /api/payments?month=YYYY-MM
const getPayments = async (req, res) => {
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const dbPayments = await Payment.find({ month }).populate('student', 'name roomNumber').sort({ date: -1 });
    return res.json(dbPayments || []);
  } catch (err) {
    console.error('Error fetching payments from DB:', err);
    return res.status(500).json({ message: 'Failed to fetch payments from database' });
  }
};

// @desc    Record advance deposit
// @route   POST /api/payments
const addPayment = async (req, res) => {
  const { date, studentId, amount, paymentMethod, note } = req.body;

  if (!date || !studentId || !amount) {
    return res.status(400).json({ message: 'Date, studentId, and amount are required' });
  }

  const month = date.substring(0, 7);

  try {
    const payment = await Payment.create({
      date,
      student: studentId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'UPI',
      note: note || '',
      month
    });

    await logActivity({
      req,
      actionType: 'DEPOSIT_RECORDED',
      entityName: 'Mess Payments',
      description: `Recorded mess deposit of ₹${amount} via ${paymentMethod || 'UPI'}`,
      oldValue: 'None',
      newValue: `₹${amount}`
    });

    return res.status(201).json(payment);
  } catch (err) {
    console.error('Error recording payment in DB:', err);
    return res.status(500).json({ message: 'Failed to record deposit in database' });
  }
};

module.exports = {
  getPayments,
  addPayment
};
