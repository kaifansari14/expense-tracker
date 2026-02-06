import express from 'express';
import Expense from '../models/Expense.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.date) {
      query.date = req.query.date;
    }
    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (amount == null || !date) {
      return res.status(400).json({ error: 'amount and date are required' });
    }

    const expense = new Expense({
      userId: req.user._id,
      amount: Number(amount),
      category: category || 'Other',
      description: description || '',
      date,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    Object.assign(expense, req.body);
    if (req.body.amount != null) {
      expense.amount = Number(req.body.amount);
    }

    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
