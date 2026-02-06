import { useState, useEffect, useCallback } from 'react'
import Auth from './Auth.jsx'
import { getToken, isAuthenticated, removeToken, getUser } from './auth.js'

const API = '/api'
const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other']

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

function today() {
  return formatDate(new Date())
}

async function fetchJson(url, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      removeToken()
      window.location.reload()
      return
    }
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  if (res.status === 204) return null
  return res.json()
}

function ExpenseTracker() {
  const [salary, setSalaryState] = useState(null)
  const [salaryLoading, setSalaryLoading] = useState(true)
  const [salaryAmount, setSalaryAmount] = useState('')
  const [salaryPeriod, setSalaryPeriod] = useState('monthly')
  const [selectedDate, setSelectedDate] = useState(today())
  const [expenses, setExpenses] = useState([])
  const [expensesLoading, setExpensesLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: today() })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const user = getUser()

  const loadSalary = useCallback(async () => {
    try {
      const data = await fetchJson(`${API}/salary`)
      setSalaryState(data)
      if (data) {
        setSalaryAmount(String(data.amount))
        setSalaryPeriod(data.period || 'monthly')
      } else {
        setSalaryAmount('')
        setSalaryPeriod('monthly')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSalaryLoading(false)
    }
  }, [])

  const loadExpenses = useCallback(async () => {
    setExpensesLoading(true)
    try {
      const data = await fetchJson(`${API}/expenses?date=${selectedDate}`)
      setExpenses(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setExpensesLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadSalary()
  }, [loadSalary])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const showMsg = (msg) => {
    setMessage(msg)
    setError('')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = () => {
    removeToken()
    window.location.reload()
  }

  const handleSaveSalary = async (e) => {
    e.preventDefault()
    const amount = parseFloat(salaryAmount)
    if (Number.isNaN(amount) || amount < 0) {
      setError('Enter a valid salary amount')
      return
    }
    try {
      await fetchJson(`${API}/salary`, {
        method: 'PUT',
        body: JSON.stringify({ amount, period: salaryPeriod }),
      })
      setSalaryState({ amount, period: salaryPeriod })
      showMsg('Salary saved.')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (Number.isNaN(amount) || amount < 0) {
      setError('Enter a valid amount')
      return
    }
    if (!form.date) {
      setError('Select a date')
      return
    }
    try {
      await fetchJson(`${API}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          category: form.category,
          description: form.description.trim(),
          date: form.date,
        }),
      })
      setForm({ amount: '', category: 'Food', description: '', date: selectedDate })
      showMsg('Expense added.')
      loadExpenses()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleUpdateExpense = async (e) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (Number.isNaN(amount) || amount < 0) {
      setError('Enter a valid amount')
      return
    }
    try {
      await fetchJson(`${API}/expenses/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          amount,
          category: form.category,
          description: form.description.trim(),
          date: form.date,
        }),
      })
      setEditingId(null)
      setForm({ amount: '', category: 'Food', description: '', date: selectedDate })
      showMsg('Expense updated.')
      loadExpenses()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEdit = (exp) => {
    setEditingId(exp._id || exp.id)
    setForm({
      amount: String(exp.amount),
      category: exp.category || 'Other',
      description: exp.description || '',
      date: exp.date,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ amount: '', category: 'Food', description: '', date: selectedDate })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await fetchJson(`${API}/expenses/${id}`, { method: 'DELETE' })
      showMsg('Expense deleted.')
      loadExpenses()
    } catch (e) {
      setError(e.message)
    }
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const dailyBudget =
    salary?.amount != null
      ? salary.period === 'daily'
        ? salary.amount
        : salary.amount / 30
      : null
  const remaining = dailyBudget != null ? dailyBudget - totalSpent : null

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Expense Tracker
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {/* Salary */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">Salary / Budget</h2>
          {salaryLoading ? (
            <p className="text-stone-500">Loading…</p>
          ) : (
            <form onSubmit={handleSaveSalary} className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-600">
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  className="w-36 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-600">
                  Period
                </label>
                <select
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Save salary
              </button>
            </form>
          )}
        </section>

        {/* Date & Summary */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">
              View expenses for
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-stone-500">Spent today: </span>
              <span className="font-semibold text-stone-900">
                ₹{totalSpent.toFixed(2)}
              </span>
            </div>
            {remaining != null && (
              <div>
                <span className="text-stone-500">Remaining (daily): </span>
                <span
                  className={`font-semibold ${remaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                >
                  ₹{remaining.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Add / Edit expense */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            {editingId ? 'Edit expense' : 'Add expense'}
          </h2>
          <form
            onSubmit={editingId ? handleUpdateExpense : handleAddExpense}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">
                Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-stone-600">
                Description (optional)
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. Lunch, Uber"
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Expense list */}
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            Expenses for {selectedDate}
          </h2>
          {expensesLoading ? (
            <p className="text-stone-500">Loading…</p>
          ) : expenses.length === 0 ? (
            <p className="text-stone-500">No expenses for this day. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {expenses.map((exp) => (
                <li
                  key={exp._id || exp.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-stone-900">
                      ₹{Number(exp.amount).toFixed(2)}
                    </span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-sm text-amber-800">
                      {exp.category}
                    </span>
                    {exp.description && (
                      <span className="text-stone-600">{exp.description}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(exp)}
                      className="rounded px-2 py-1 text-sm text-amber-700 hover:bg-amber-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp._id || exp.id)}
                      className="rounded px-2 py-1 text-sm text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setChecking(false)
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-600">Loading...</p>
      </div>
    )
  }

  if (!authenticated) {
    return <Auth onLogin={() => setAuthenticated(true)} />
  }

  return <ExpenseTracker />
}
