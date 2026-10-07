import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await api.register(form)
      setSuccess('Account created successfully. Redirecting to login...')
      setTimeout(() => navigate('/login'), 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page shell">
      <div className="auth-card">
        <div className="eyebrow">Create your account</div>
        <h1>Join NexaCart</h1>
        <p className="muted">Your cart and orders stay tied to your authenticated account.</p>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <form className="stack-form" onSubmit={submit}>
          <label>Name<input minLength="2" maxLength="100" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <button className="button full" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </main>
  )
}
