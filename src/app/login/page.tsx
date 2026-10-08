'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getApiErrorMessage, setToken, setUser } from '@/lib/api';
import AuthShell, { Field, GoogleButton, Notice, OrDivider, SubmitButton } from '@/components/AuthShell';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState('');

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
    try {
      await api.post('/api/auth/verify-credentials', form);
      await api.post('/api/otp/send', { email: form.email });
      setOtpSent(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
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
      setInfo('Kode baru sudah dikirim.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP'));
    } finally {
      setResending(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-paper" aria-busy="true" />;

  if (otpSent) return (
    <AuthShell
      title="Cek email kamu"
      subtitle={<>Kami kirim kode 6 angka ke <span className="font-medium text-ink">{form.email}</span>. Berlaku 5 menit.</>}
      footer={
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); setInfo(''); }}
            className="underline-offset-4 hover:text-ink hover:underline">← Ganti email</button>
          <button type="button" onClick={handleResendOtp} disabled={resending}
            className="text-accent underline-offset-4 hover:underline disabled:opacity-50">
            {resending ? 'Mengirim…' : 'Kirim ulang kode'}
          </button>
        </div>
      }>
      {error && <Notice tone="error">{error}</Notice>}
      {info && !error && <Notice tone="ok">{info}</Notice>}
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <Field id="login-otp" label="Kode verifikasi" type="text" inputMode="numeric" autoComplete="one-time-code"
          pattern="\d{6}" maxLength={6} placeholder="000000" value={otp} required autoFocus
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          className="font-mono text-xl tracking-[0.4em]" />
        <SubmitButton busy={otpLoading}>Masuk</SubmitButton>
      </form>
    </AuthShell>
  );

  return (
    <AuthShell
      title="Masuk"
      subtitle="Lanjutkan ngerjain portfolio kamu."
      footer={<>Belum punya akun? <Link href="/register" className="font-medium text-accent underline-offset-4 hover:underline">Daftar gratis</Link></>}>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="login-email" label="Email" type="email" autoComplete="email" placeholder="nama@email.com"
          value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} />
        <div>
          <Field id="login-password" label="Password" type="password" autoComplete="current-password"
            value={form.password} required onChange={e => setForm({ ...form, password: e.target.value })} />
          <Link href="/forgot-password" className="mt-2 inline-block text-xs text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            Lupa password?
          </Link>
        </div>
        <SubmitButton busy={submitting}>Lanjut</SubmitButton>
      </form>
      <OrDivider />
      <GoogleButton label="Masuk dengan Google" />
    </AuthShell>
  );
}
