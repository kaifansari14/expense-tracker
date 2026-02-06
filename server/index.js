import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import salaryRoutes from './routes/salary.js';
import expensesRoutes from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/expenses', expensesRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
