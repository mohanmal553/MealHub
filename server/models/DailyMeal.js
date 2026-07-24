const mongoose = require('mongoose');

const dailyMealSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    student: { type: mongoose.Schema.Types.Mixed, required: true }, // Accepts ObjectId or String ID
    status: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
    mealCount: { type: Number, default: 1, min: 0, max: 5 },
    note: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Index to ensure unique meal record per student per day
dailyMealSchema.index({ date: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('DailyMeal', dailyMealSchema);
