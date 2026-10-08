'use client';
import { useState } from 'react';
import Link from 'next/link';
import api, { getApiErrorMessage } from '@/lib/api';
import AuthShell, { Field, GoogleButton, Notice, OrDivider, SubmitButton } from '@/components/AuthShell';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords don't match."); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/register', { name: form.name, email: form.email, password: form.password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Register failed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <AuthShell
      title="One more step"
      subtitle={<>We sent a verification link to <span className="font-medium text-ink">{form.email}</span>. Open the email, click the link, then log in.</>}
      footer={<>Not in your inbox? Check your spam or promotions folder.</>}>
      <Link href="/login"
        className="block w-full rounded-md bg-ink px-4 py-2.5 text-center text-[15px] font-medium text-paper transition-colors hover:bg-black">
        Go to log in
      </Link>
    </AuthShell>
  );

  return (
    <AuthShell
      title="Create an account"
      subtitle="Free. No credit card needed."
      footer={<>Already have an account? <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">Log in</Link></>}>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="reg-name" label="Full name" type="text" autoComplete="name" placeholder="The name shown on your portfolio"
          value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} />
        <Field id="reg-email" label="Email" type="email" autoComplete="email" placeholder="you@email.com"
          value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} />
        <Field id="reg-password" label="Password" type="password" autoComplete="new-password" minLength={8}
          hint="At least 8 characters." value={form.password} required onChange={e => setForm({ ...form, password: e.target.value })} />
        <Field id="reg-confirm" label="Confirm password" type="password" autoComplete="new-password"
          value={form.confirmPassword} required onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
        <SubmitButton busy={loading}>Create account</SubmitButton>
      </form>
      <OrDivider />
      <GoogleButton label="Sign up with Google" />
    </AuthShell>
  );
}
