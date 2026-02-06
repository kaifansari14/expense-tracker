# Expense Tracker

Web app to set your salary and log daily expenses. React (Vite) frontend, Node.js (Express) backend with MongoDB.

## Setup

1. **Install dependencies:**
   ```bash
   cd server && pnpm install
   cd ../client && pnpm install
   ```

2. **Configure environment:**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
   JWT_SECRET=your-secret-key-change-this-in-production
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   # macOS with Homebrew:
   brew services start mongodb-community
   # Linux:
   sudo systemctl start mongod
   # Or use MongoDB Atlas cloud service
   ```

## Run

**Terminal 1 – backend**
```bash
cd server && pnpm run dev
```
Server: http://localhost:3001

**Terminal 2 – frontend**
```bash
cd client && pnpm run dev
```
App: http://localhost:5173 (API requests are proxied to the server).

## Features

- **Authentication:** Register and login with email/password (JWT-based)
- **Salary:** Set monthly or daily budget; stored per user and editable
- **Expenses:** Add per day with amount, category (Food, Transport, Bills, Shopping, Other), optional description, and date. View, edit, delete
- **Summary:** Total spent for the selected day and remaining (daily budget − spent)
- **Database:** MongoDB with Mongoose (user-specific data)
