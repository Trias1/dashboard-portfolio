'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getApiErrorMessage, setToken, setUser } from '@/lib/api';
import AuthShell, { Field, GoogleButton, Notice, OrDivider, SubmitButton } from '@/components/AuthShell';

// Messages for the ?error= / ?verified= that the Google sign-in and email-verification links redirect here with.
const GOOGLE_ERRORS: Record<string, string> = {
  rate_limited: 'Too many sign-in attempts. Wait a few minutes and try again.',
  email_not_verified: "Your Google email isn't verified yet. Verify it with Google, then try again.",
  account_inactive: "This account is inactive. Contact support if you think that's a mistake.",
};
const urlNotice = (): { error?: string; info?: string } => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const verified = params.get('verified');
  if (verified === 'true') return { info: 'Email verified. You can log in now.' };
  if (verified === 'failed') return { error: 'That verification link is invalid or has expired. Log in to get a new one.' };
  const error = params.get('error');
  if (error) return { error: GOOGLE_ERRORS[error] || "Google sign-in didn't work. Try again, or log in with your email." };
  return {};
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(() => urlNotice().error || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState(() => urlNotice().info || '');
  // Set when the password was right but the email isn't verified yet: offer a new link.
  const [needsVerify, setNeedsVerify] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        setToken(res.data.accessToken);
        const user = res.data.user || JSON.parse(localStorage.getItem('user') || '{}');
        router.replace(user.role === 'admin' || user.role === 'superadmin' ? '/dashboard' : '/portfolio');
      } catch {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setInfo('');
    setNeedsVerify(false);
    try {
      await api.post('/api/auth/verify-credentials', form);
      await api.post('/api/otp/send', { email: form.email });
      setOtpSent(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'));
      setNeedsVerify(axios.isAxiosError(err) && err.response?.status === 403 && /verify your email/i.test(String(err.response?.data?.message || '')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setSendingLink(true);
    try {
      const res = await api.post('/api/auth/resend-verification', form);
      setError('');
      setNeedsVerify(false);
      setInfo(res.data?.message || 'A new verification link is on its way.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not send a new link'));
    } finally {
      setSendingLink(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setError('');
    try {
      const res = await api.post('/api/otp/verify', { email: form.email, otp: otp.trim() });
      if (res.data.accessToken) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        const u = res.data.user;
        window.location.assign(u.role === 'superadmin' || u.role === 'admin' ? '/dashboard' : '/portfolio');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid OTP'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setInfo('');
    try {
      await api.post('/api/otp/send', { email: form.email });
      setInfo('New code sent.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP'));
    } finally {
      setResending(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-paper font-sans" aria-busy="true">
      <p className="text-sm text-ink-soft">Checking your session…</p>
    </div>
  );

  if (otpSent) return (
    <AuthShell
      title="Check your email"
      subtitle={<>We sent a 6-digit code to <span className="font-medium text-ink">{form.email}</span>. It expires in 5 minutes.</>}
      footer={
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); setInfo(''); }}
            className="underline-offset-4 hover:text-ink hover:underline">← Use a different email</button>
          <button type="button" onClick={handleResendOtp} disabled={resending}
            className="text-accent underline-offset-4 hover:underline disabled:opacity-50">
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      }>
      {error && <Notice tone="error">{error}</Notice>}
      {info && !error && <Notice tone="ok">{info}</Notice>}
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <Field id="login-otp" label="Verification code" type="text" inputMode="numeric" autoComplete="one-time-code"
          pattern="\d{6}" maxLength={6} placeholder="000000" value={otp} required autoFocus
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          className="font-mono text-xl tracking-[0.4em]" />
        <SubmitButton busy={otpLoading}>Log in</SubmitButton>
      </form>
    </AuthShell>
  );

  return (
    <AuthShell
      title="Log in"
      subtitle="Pick up where you left off."
      footer={<>Don&apos;t have an account? <Link href="/register" className="font-medium text-accent underline-offset-4 hover:underline">Sign up free</Link></>}>
      {error && <Notice tone="error">{error}</Notice>}
      {needsVerify && (
        <button type="button" onClick={handleResendVerification} disabled={sendingLink}
          className="-mt-2 mb-4 text-sm font-medium text-accent underline-offset-4 hover:underline disabled:opacity-50">
          {sendingLink ? 'Sending…' : 'Send me a new verification link'}
        </button>
      )}
      {info && !error && <Notice tone="ok">{info}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="login-email" label="Email" type="email" autoComplete="email" placeholder="you@email.com"
          value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} />
        <div>
          <Field id="login-password" label="Password" type="password" autoComplete="current-password"
            value={form.password} required onChange={e => setForm({ ...form, password: e.target.value })} />
          <Link href="/forgot-password" className="mt-2 inline-block text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton busy={submitting}>Continue</SubmitButton>
      </form>
      <OrDivider />
      <GoogleButton label="Log in with Google" />
    </AuthShell>
  );
}
