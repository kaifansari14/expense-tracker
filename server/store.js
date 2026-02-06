import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { salary: null, expenses: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function getSalary() {
  return readData().salary;
}

export function setSalary(salary) {
  const data = readData();
  data.salary = salary;
  writeData(data);
  return data.salary;
}

export function getExpenses(dateFilter = null) {
  const { expenses } = readData();
  if (!dateFilter) return expenses;
  return expenses.filter((e) => e.date === dateFilter);
}

export function getExpenseById(id) {
  const { expenses } = readData();
  return expenses.find((e) => e.id === id);
}

export function addExpense(expense) {
  const data = readData();
  const id = String(Date.now());
  const entry = { id, ...expense };
  data.expenses.push(entry);
  writeData(data);
  return entry;
}

export function updateExpense(id, updates) {
  const data = readData();
  const idx = data.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  data.expenses[idx] = { ...data.expenses[idx], ...updates };
  writeData(data);
  return data.expenses[idx];
}

export function deleteExpense(id) {
  const data = readData();
  const idx = data.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  data.expenses.splice(idx, 1);
  writeData(data);
  return true;
}
