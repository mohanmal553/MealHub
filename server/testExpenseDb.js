const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Expense = require('./models/Expense');

dotenv.config();

const testExpense = async () => {
  try {
    await connectDB();

    console.log('Testing Expense DB Save...');
    const exp = await Expense.create({
      date: '2026-07-24',
      itemName: 'Test Grocery Item',
      category: 'general',
      cost: 500,
      paidBy: null,
      paidByName: 'MealHub Admin',
      notes: 'Testing DB save'
    });

    console.log('DB Saved Expense Document:', exp);

    const fetched = await Expense.find({ date: '2026-07-24' });
    console.log('DB Fetched Expenses Count:', fetched.length);

    await Expense.deleteOne({ _id: exp._id });
    console.log('Cleaned test expense record. Test Passed!');
    process.exit(0);
  } catch (err) {
    console.error('Expense DB Test Failed:', err);
    process.exit(1);
  }
};

testExpense();
