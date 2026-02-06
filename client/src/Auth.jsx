import { useState } from 'react'
import { getToken, setToken, setUser } from './auth'

const API = '/api'

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/login' : '/register'
      const data = await fetchJson(`${API}/auth${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      setToken(data.token)
      setUser(data.user)
      onLogin()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg ring-1 ring-stone-200">
        <h1 className="mb-6 text-center text-2xl font-bold text-stone-900">
          Expense Tracker
        </h1>
        <h2 className="mb-6 text-center text-lg font-semibold text-stone-700">
          {isLogin ? 'Login' : 'Register'}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="••••••"
              required
              minLength={6}
            />
            {!isLogin && (
              <p className="mt-1 text-xs text-stone-500">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-sm text-amber-600 hover:text-amber-700"
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
