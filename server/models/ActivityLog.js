const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actionType: { type: String, required: true }, // e.g. EXPENSE_CREATED, MEAL_TOGGLED
    entityName: { type: String, required: true }, // e.g. Market Expense, Meal Status, Member Directory
    description: { type: String, required: true },
    oldValue: { type: String, default: 'N/A' },
    newValue: { type: String, default: 'N/A' },
    performedBy: { type: String, required: true, default: 'System User' },
    performedByRole: { type: String, default: 'student' },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

activityLogSchema.index({ date: 1, timestamp: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
