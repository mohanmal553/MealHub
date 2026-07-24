const Payment = require('../models/Payment');
const { inMemPayments, generateId } = require('../utils/inMemoryStore');

// @desc    Get payments/deposits for a month
// @route   GET /api/payments?month=YYYY-MM
const getPayments = async (req, res) => {
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const dbPayments = await Payment.find({ month }).populate('student', 'name roomNumber').sort({ date: -1 });
    return res.json(dbPayments || []);
  } catch (err) {}

  const memPayments = inMemPayments.filter(p => p.month === month);
  res.json(memPayments);
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
    return res.status(201).json(payment);
  } catch (err) {}

  const newMemPay = {
    _id: 'pay_' + generateId(),
    date,
    student: studentId,
    amount: Number(amount),
    paymentMethod: paymentMethod || 'UPI',
    note: note || '',
    month
  };

  inMemPayments.push(newMemPay);
  res.status(201).json(newMemPay);
};

module.exports = {
  getPayments,
  addPayment
};
