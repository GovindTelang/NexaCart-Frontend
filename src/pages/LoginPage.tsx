import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";

interface LoginLocationState {
  from?: { pathname?: string };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginState } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await api.login(form.email, form.password);
      if (!user) throw new Error("We couldn't read your account details. Please sign in again.");
      loginState(user);
      const state = location.state as LoginLocationState | null;
      navigate(state?.from?.pathname || "/", { replace: true });
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Sign in failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page shell">
      <section className="auth-editorial"><span className="eyebrow">WELCOME BACK</span><h1>Your good finds are waiting.</h1><p>Sign in to pick up where you left off, keep your basket close, and find your orders in one place.</p><div className="auth-editorial-mark">N.</div><span className="auth-editorial-foot">GOOD THINGS, MADE SIMPLE.</span></section>
      <section className="auth-card">
        <span className="eyebrow">YOUR NEXACART ACCOUNT</span>
        <h2>Sign in</h2>
        <p className="auth-subtitle">Welcome back. Enter your details below.</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        <form className="stack-form" onSubmit={submit}>
          <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" /></label>
          <button className="button full auth-submit" disabled={busy}>{busy ? "Signing you in…" : "Sign in to NexaCart"}<span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-switch">New to NexaCart? <Link to="/register">Create an account</Link></p>
        <div className="auth-security"><span>◇</span><span>Your account is protected by secure token-based sign in.</span></div>
      </section>
    </main>
  );
}
