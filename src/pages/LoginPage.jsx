import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginState } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await api.login(form.email, form.password)
      loginState(user)
      navigate(location.state?.from?.pathname || '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page shell">
      <div className="auth-card">
        <div className="eyebrow">Welcome back</div>
        <h1>Log in to NexaCart</h1>
        <p className="muted">Use your NexaCart account to access your cart and orders.</p>
        {error && <div className="alert error">{error}</div>}
        <form className="stack-form" onSubmit={submit}>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <button className="button full" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </main>
  )
}
