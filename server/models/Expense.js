import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Bills', 'Shopping', 'Other'],
    default: 'Other',
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  },
}, {
  timestamps: true,
});

expenseSchema.index({ userId: 1, date: 1 });

export default mongoose.model('Expense', expenseSchema);
