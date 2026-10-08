'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api, { getApiErrorMessage } from '@/lib/api';
import AuthShell, { Field, Notice, SubmitButton } from '@/components/AuthShell';

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't save your new password"));
    } finally { setLoading(false); }
  };

  const loginLink = <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">Log in now →</Link>;

  if (!token) return (
    <AuthShell
      title="Invalid link"
      subtitle="This reset link is broken or incomplete. Request a new one from the forgot password page."
      footer={loginLink}>
      <Link href="/forgot-password"
        className="block w-full rounded-md bg-ink px-4 py-2.5 text-center text-[15px] font-medium text-paper transition-colors hover:bg-black">
        Request a new link
      </Link>
    </AuthShell>
  );

  if (success) return (
    <AuthShell
      title="Password saved"
      subtitle="Taking you to the log in page in a few seconds."
      footer={loginLink}>
      <Notice tone="ok">Your new password is active.</Notice>
    </AuthShell>
  );

  return (
    <AuthShell title="Set a new password" subtitle="Use one you don't use anywhere else.">
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="reset-password" label="New password" type="password" autoComplete="new-password" minLength={8}
          hint="At least 8 characters." value={password} required onChange={e => setPassword(e.target.value)} />
        <Field id="reset-confirm" label="Confirm password" type="password" autoComplete="new-password"
          value={confirm} required onChange={e => setConfirm(e.target.value)} />
        <SubmitButton busy={loading}>Save password</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetContent /></Suspense>;
}
