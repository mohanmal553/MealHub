const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['UPI', 'Cash', 'Bank Transfer', 'Other'], default: 'UPI' },
    note: { type: String, default: '' },
    month: { type: String, required: true, index: true } // Format: YYYY-MM
  },
  { timestamps: true }
);

paymentSchema.index({ month: 1, student: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
