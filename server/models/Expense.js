const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    itemName: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      enum: ['general', 'special'], 
      default: 'general',
      required: true 
    },
    cost: { type: Number, required: true, min: 0 },
    paidBy: { type: mongoose.Schema.Types.Mixed, default: null },
    paidByName: { type: String, default: 'MealHub Admin' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

expenseSchema.index({ date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
