const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get expenses for a month from database
// @route   GET /api/expenses?month=YYYY-MM
const getExpenses = async (req, res) => {
  const month = req.query.month || new Date().toISOString().substring(0, 7);

  try {
    const dbExpenses = await Expense.find({ date: { $regex: `^${month}` } })
      .sort({ date: -1 })
      .lean();

    return res.json(dbExpenses || []);
  } catch (err) {
    console.error('Error fetching expenses from DB:', err.message);
    return res.status(500).json({ message: 'Failed to fetch market expenses from database' });
  }
};

// @desc    Create a new grocery market expense
// @route   POST /api/expenses
const addExpense = async (req, res) => {
  const { date, itemName, category, cost, paidBy, paidByName, notes } = req.body;

  if (!date || !itemName || cost === undefined) {
    return res.status(400).json({ message: 'Date, itemName, and cost are required' });
  }

  try {
    let pBy = null;
    if (paidBy && mongoose.Types.ObjectId.isValid(paidBy)) {
      pBy = new mongoose.Types.ObjectId(paidBy);
    } else if (paidBy && typeof paidBy === 'string' && paidBy.trim() !== '') {
      pBy = paidBy.trim();
    }

    let cBy = null;
    if (req.user && req.user._id) {
      cBy = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : req.user._id;
    }

    const expense = await Expense.create({
      date,
      itemName: itemName.trim(),
      category: category || 'general',
      cost: Number(cost),
      paidBy: pBy,
      paidByName: paidByName || 'Member',
      notes: notes || '',
      createdBy: cBy
    });

    await logActivity({
      req,
      actionType: 'EXPENSE_CREATED',
      entityName: 'Market Expenses',
      description: `Logged new ${category || 'general'} grocery item "${itemName.trim()}" on ${date}`,
      oldValue: 'None',
      newValue: `₹${cost} (Paid by ${paidByName || 'Member'})`
    });

    console.log(`✅ Expense DB Save Success: ${itemName} (₹${cost}) by ${paidByName}`);
    return res.status(201).json(expense);
  } catch (err) {
    console.error('Error adding expense to DB:', err);
    return res.status(500).json({ message: 'Failed to save expense to database' });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  const { date, itemName, category, cost, paidBy, paidByName, notes } = req.body;
  const expId = req.params.id;

  try {
    const exp = await Expense.findById(expId);
    if (!exp) {
      return res.status(404).json({ message: 'Expense record not found' });
    }

    const oldSummary = `"${exp.itemName}" (₹${exp.cost})`;

    if (date) exp.date = date;
    if (itemName) exp.itemName = itemName.trim();
    if (category) exp.category = category;
    if (cost !== undefined) exp.cost = Number(cost);
    if (paidBy !== undefined) {
      exp.paidBy = (paidBy && mongoose.Types.ObjectId.isValid(paidBy)) ? new mongoose.Types.ObjectId(paidBy) : paidBy;
    }
    if (paidByName !== undefined) exp.paidByName = paidByName;
    if (notes !== undefined) exp.notes = notes;

    const updated = await exp.save();

    await logActivity({
      req,
      actionType: 'EXPENSE_UPDATED',
      entityName: 'Market Expenses',
      description: `Updated grocery expense details for "${updated.itemName}"`,
      oldValue: oldSummary,
      newValue: `"${updated.itemName}" (₹${updated.cost})`
    });

    console.log(`✅ Expense DB Update Success: ${expId}`);
    return res.json(updated);
  } catch (err) {
    console.error('Error updating expense in DB:', err);
    return res.status(500).json({ message: 'Failed to update expense in database' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  const expId = req.params.id;

  try {
    const exp = await Expense.findById(expId);
    if (!exp) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const oldSummary = `"${exp.itemName}" (₹${exp.cost})`;
    await Expense.findByIdAndDelete(expId);

    await logActivity({
      req,
      actionType: 'EXPENSE_DELETED',
      entityName: 'Market Expenses',
      description: `Deleted market expense record "${exp.itemName}"`,
      oldValue: oldSummary,
      newValue: 'DELETED'
    });

    console.log(`✅ Expense DB Delete Success: ${expId}`);
    return res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Error deleting expense from DB:', err);
    return res.status(500).json({ message: 'Failed to delete expense from database' });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
};
