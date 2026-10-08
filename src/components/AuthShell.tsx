import Link from 'next/link';
import type { InputHTMLAttributes, ReactNode } from 'react';

// Shared frame for login / register / forgot / reset. Plain paper, one accent, no effects.
export default function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="hidden md:flex flex-col justify-between border-r border-rule bg-paper-deep px-10 py-10">
        <Link href="/" className="font-display font-semibold text-xl tracking-tight">PortfolioKit</Link>
        <div className="max-w-xs">
          <p className="font-display font-semibold text-3xl leading-snug">
            One page that explains what you do.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Add your details once, pick a layout, share the link. Switch templates any time without retyping anything.
          </p>
        </div>
        <p className="text-xs text-ink-soft">Made by Trias, in Indonesia.</p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10 md:min-h-0 md:justify-center md:py-16">
        <Link href="/" className="mb-12 font-display font-semibold text-xl tracking-tight md:hidden">PortfolioKit</Link>
        <div className="w-full max-w-sm md:mx-auto">
          <h1 className="font-display font-semibold text-3xl tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-rule pt-6 text-sm text-ink-soft">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export function Field({ id, label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={id} {...props}
        className={`w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-[#9a9aa0] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10 ${props.className || ''}`} />
      {hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy?: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={busy}
      className="w-full rounded-md bg-ink px-4 py-2.5 text-[15px] font-medium text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
      {busy ? 'One moment…' : children}
    </button>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'ok'; children: ReactNode }) {
  const cls = tone === 'error'
    ? 'border-red-300 bg-red-50 text-red-800'
    : 'border-emerald-300 bg-emerald-50 text-emerald-800';
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-md border px-3 py-2.5 text-sm ${cls}`}>{children}</div>;
}

export function GoogleButton({ label }: { label: string }) {
  return (
    <a href="/api/auth/google"
      className="flex w-full items-center justify-center gap-2.5 rounded-md border border-rule bg-white px-4 py-2.5 text-[15px] font-medium text-ink transition-colors hover:border-ink-soft">
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {label}
    </a>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-ink-soft">
      <span className="h-px flex-1 bg-rule" />or<span className="h-px flex-1 bg-rule" />
    </div>
  );
}
