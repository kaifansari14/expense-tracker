import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  period: {
    type: String,
    enum: ['monthly', 'daily'],
    default: 'monthly',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Salary', salarySchema);
