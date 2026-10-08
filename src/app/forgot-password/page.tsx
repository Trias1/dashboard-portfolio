'use client';
import { useState } from 'react';
import Link from 'next/link';
import api, { getApiErrorMessage } from '@/lib/api';
import AuthShell, { Field, Notice, SubmitButton } from '@/components/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't send the email"));
    } finally { setLoading(false); }
  };

  const backToLogin = <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">← Back to log in</Link>;

  if (sent) return (
    <AuthShell
      title="Check your email"
      subtitle={<>If <span className="font-medium text-ink">{email}</span> has an account, we sent a link to set a new password. The link expires in 1 hour.</>}
      footer={backToLogin}>
      <p className="text-sm text-ink-soft">Not in your inbox? Check your spam folder, or try again in a few minutes.</p>
    </AuthShell>
  );

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your account email and we'll send you a link to set a new password."
      footer={backToLogin}>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="forgot-email" label="Email" type="email" autoComplete="email" placeholder="you@email.com"
          value={email} required onChange={e => setEmail(e.target.value)} />
        <SubmitButton busy={loading}>Send link</SubmitButton>
      </form>
    </AuthShell>
  );
}
