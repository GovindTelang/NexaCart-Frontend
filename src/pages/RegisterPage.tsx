import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { RegisterPayload } from "../types/api";
import { getErrorMessage } from "../utils/errors";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterPayload>({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.register(form);
      setSuccess("Your account is ready. Taking you to sign in…");
      window.setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "We couldn't create your account."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page shell">
      <section className="auth-editorial register-editorial"><span className="eyebrow">A LITTLE MORE YOU</span><h1>Your next favourite thing is out there.</h1><p>Make a NexaCart account and keep your shopping simple, from first browse to order history.</p><div className="auth-editorial-mark">N.</div><span className="auth-editorial-foot">DISCOVER YOUR EVERYDAY.</span></section>
      <section className="auth-card">
        <span className="eyebrow">START HERE</span>
        <h2>Create account</h2>
        <p className="auth-subtitle">Just the essentials to get you going.</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}
        <form className="stack-form" onSubmit={submit}>
          <label>Your name<input autoComplete="name" minLength={2} maxLength={100} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="How should we call you?" /></label>
          <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
          <label>Password<input type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label>
          <button className="button full auth-submit" disabled={busy}>{busy ? "Creating your account…" : "Create my account"}<span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <div className="auth-security"><span>◇</span><span>Your account details are sent securely to NexaCart.</span></div>
      </section>
    </main>
  );
}
