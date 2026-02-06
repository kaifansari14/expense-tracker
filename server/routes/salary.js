import express from 'express';
import Salary from '../models/Salary.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const salary = await Salary.findOne({ userId: req.user._id });
    res.json(salary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { amount, period } = req.body;

    if (amount == null || (period && !['monthly', 'daily'].includes(period))) {
      return res.status(400).json({
        error: 'Invalid salary: amount required, period must be "monthly" or "daily"',
      });
    }

    const salary = await Salary.findOneAndUpdate(
      { userId: req.user._id },
      { amount: Number(amount), period: period || 'monthly' },
      { new: true, upsert: true }
    );

    res.json(salary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
