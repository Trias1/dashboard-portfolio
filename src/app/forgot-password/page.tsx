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
      setError(getApiErrorMessage(err, 'Gagal mengirim email'));
    } finally { setLoading(false); }
  };

  const backToLogin = <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">← Kembali ke halaman masuk</Link>;

  if (sent) return (
    <AuthShell
      title="Cek email kamu"
      subtitle={<>Kalau <span className="font-medium text-ink">{email}</span> terdaftar, link untuk bikin password baru sudah dikirim. Link-nya berlaku 1 jam.</>}
      footer={backToLogin}>
      <p className="text-sm text-ink-soft">Tidak ada di inbox? Cek folder spam, atau coba lagi beberapa menit lagi.</p>
    </AuthShell>
  );

  return (
    <AuthShell
      title="Lupa password"
      subtitle="Masukkan email akunmu. Kami kirim link untuk bikin password baru."
      footer={backToLogin}>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="forgot-email" label="Email" type="email" autoComplete="email" placeholder="nama@email.com"
          value={email} required onChange={e => setEmail(e.target.value)} />
        <SubmitButton busy={loading}>Kirim link</SubmitButton>
      </form>
    </AuthShell>
  );
}
