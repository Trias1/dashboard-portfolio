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
    if (password !== confirm) { setError('Konfirmasi password belum sama.'); return; }
    if (password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Gagal menyimpan password baru'));
    } finally { setLoading(false); }
  };

  const loginLink = <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">Masuk sekarang →</Link>;

  if (!token) return (
    <AuthShell
      title="Link tidak valid"
      subtitle="Link reset ini rusak atau tidak lengkap. Minta link baru lewat halaman lupa password."
      footer={loginLink}>
      <Link href="/forgot-password"
        className="block w-full rounded-md bg-ink px-4 py-2.5 text-center text-[15px] font-medium text-paper transition-colors hover:bg-black">
        Minta link baru
      </Link>
    </AuthShell>
  );

  if (success) return (
    <AuthShell
      title="Password tersimpan"
      subtitle="Kamu akan diarahkan ke halaman masuk dalam beberapa detik."
      footer={loginLink}>
      <Notice tone="ok">Password baru sudah aktif.</Notice>
    </AuthShell>
  );

  return (
    <AuthShell title="Bikin password baru" subtitle="Pakai yang belum pernah kamu pakai di tempat lain.">
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="reset-password" label="Password baru" type="password" autoComplete="new-password" minLength={8}
          hint="Minimal 8 karakter." value={password} required onChange={e => setPassword(e.target.value)} />
        <Field id="reset-confirm" label="Ulangi password" type="password" autoComplete="new-password"
          value={confirm} required onChange={e => setConfirm(e.target.value)} />
        <SubmitButton busy={loading}>Simpan password</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetContent /></Suspense>;
}
