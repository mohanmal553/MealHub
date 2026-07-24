const mongoose = require('mongoose');

const monthlyBillSchema = new mongoose.Schema(
  {
    month: { type: String, required: true }, // Format: YYYY-MM
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String },
    roomNumber: { type: String },
    totalMeals: { type: Number, required: true, default: 0 },
    mealRate: { type: Number, required: true, default: 0 },
    generalMealCost: { type: Number, required: true, default: 0 },
    specialDishCost: { type: Number, required: true, default: 0 },
    grossTotal: { type: Number, required: true, default: 0 },
    totalPaid: { type: Number, required: true, default: 0 },
    netAmount: { type: Number, required: true, default: 0 }, // grossTotal - totalPaid
    status: { type: String, enum: ['pending', 'paid', 'settled'], default: 'pending' },
    specialBreakdown: [
      {
        date: String,
        itemName: String,
        totalCost: Number,
        onStudentCount: Number,
        studentShare: Number
      }
    ],
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

monthlyBillSchema.index({ month: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyBill', monthlyBillSchema);
