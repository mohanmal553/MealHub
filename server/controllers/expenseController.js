const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { inMemExpenses, generateId } = require('../utils/inMemoryStore');
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
  }

  const memExpenses = inMemExpenses
    .filter(e => e.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));

  res.json(memExpenses);
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
  }

  const newMemExp = {
    _id: 'exp_' + generateId(),
    date,
    itemName: itemName.trim(),
    category: category || 'general',
    cost: Number(cost),
    paidBy: paidBy || null,
    paidByName: paidByName || 'Member',
    notes: notes || ''
  };

  inMemExpenses.push(newMemExp);

  await logActivity({
    req,
    actionType: 'EXPENSE_CREATED',
    entityName: 'Market Expenses',
    description: `Logged new ${category || 'general'} grocery item "${itemName.trim()}" on ${date}`,
    oldValue: 'None',
    newValue: `₹${cost} (Paid by ${paidByName || 'Member'})`
  });

  res.status(201).json(newMemExp);
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  const { date, itemName, category, cost, paidBy, paidByName, notes } = req.body;
  const expId = req.params.id;

  try {
    const exp = await Expense.findById(expId);
    if (exp) {
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
    }
  } catch (err) {
    console.error('Error updating expense in DB:', err);
  }

  const idx = inMemExpenses.findIndex(e => e._id === expId);
  if (idx !== -1) {
    const oldSummary = `"${inMemExpenses[idx].itemName}" (₹${inMemExpenses[idx].cost})`;

    if (date) inMemExpenses[idx].date = date;
    if (itemName) inMemExpenses[idx].itemName = itemName.trim();
    if (category) inMemExpenses[idx].category = category;
    if (cost !== undefined) inMemExpenses[idx].cost = Number(cost);
    if (paidBy !== undefined) inMemExpenses[idx].paidBy = paidBy;
    if (paidByName !== undefined) inMemExpenses[idx].paidByName = paidByName;
    if (notes !== undefined) inMemExpenses[idx].notes = notes;

    await logActivity({
      req,
      actionType: 'EXPENSE_UPDATED',
      entityName: 'Market Expenses',
      description: `Updated grocery expense details for "${inMemExpenses[idx].itemName}"`,
      oldValue: oldSummary,
      newValue: `"${inMemExpenses[idx].itemName}" (₹${inMemExpenses[idx].cost})`
    });

    return res.json(inMemExpenses[idx]);
  }

  res.status(404).json({ message: 'Expense record not found' });
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  const expId = req.params.id;

  try {
    const exp = await Expense.findById(expId);
    if (exp) {
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
    }
  } catch (err) {
    console.error('Error deleting expense from DB:', err);
  }

  const idx = inMemExpenses.findIndex(e => e._id === expId);
  if (idx !== -1) {
    const exp = inMemExpenses[idx];
    const oldSummary = `"${exp.itemName}" (₹${exp.cost})`;
    inMemExpenses.splice(idx, 1);

    await logActivity({
      req,
      actionType: 'EXPENSE_DELETED',
      entityName: 'Market Expenses',
      description: `Deleted market expense record "${exp.itemName}"`,
      oldValue: oldSummary,
      newValue: 'DELETED'
    });

    return res.json({ message: 'Expense deleted' });
  }

  res.status(404).json({ message: 'Expense not found' });
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
};
