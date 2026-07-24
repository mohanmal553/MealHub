const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['UPI', 'Cash', 'Bank Transfer', 'Other'], default: 'UPI' },
    note: { type: String, default: '' },
    month: { type: String, required: true } // Format: YYYY-MM
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
