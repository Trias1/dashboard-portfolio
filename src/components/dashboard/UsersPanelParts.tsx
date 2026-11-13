'use client';

import { useEffect, useRef, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { AdminActionEntry, AdminReport } from '@/types';

export const buttonQuiet = 'rounded-md border border-rule bg-white px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink-soft disabled:cursor-not-allowed disabled:opacity-50';
export const buttonDanger = 'rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';
export const input = 'w-full rounded-md border border-rule bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10';

export const day = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const when = (value: string) => new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const REPORT_REASON: Record<string, string> = {
  spam: 'Spam, scam or misleading links',
  impersonation: "Pretends to be someone else, or uses someone's work",
  offensive: 'Offensive or harmful content',
  other: 'Something else',
};

/**
 * "Confirm it's you" before deleting an account or changing a role: a code to the admin's own email,
 * good for 10 minutes. `onConfirmed` re-runs the action that asked for it.
 */
export function SudoPrompt({ onConfirmed, onCancel }: { onConfirmed: () => void; onCancel: () => void }) {
  const [sent, setSent] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const boxRef = useRef<HTMLElement>(null);

  // It opens at the top of the panel while the admin is usually further down at the account's row: bring it into view.
  useEffect(() => {
    boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    boxRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }, []);

  const send = async () => {
    setBusy(true); setError('');
    try { setSent((await api.post<{ message: string }>('/api/admin/sudo', { action: 'send' })).data.message); }
    catch (err) { setError(getApiErrorMessage(err, 'The code could not be sent.')); }
    finally { setBusy(false); }
  };
  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/api/admin/sudo', { action: 'verify', code });
      onConfirmed();
    } catch (err) { setError(getApiErrorMessage(err, "That code isn't right.")); }
    finally { setBusy(false); }
  };

  return (
    <section ref={boxRef} role="dialog" aria-labelledby="sudo-title" className="scroll-mt-4 rounded-lg border border-accent/40 bg-white p-4">
      <h3 id="sudo-title" className="text-sm font-medium text-ink">Confirm it&apos;s you</h3>
      <p className="mt-1 text-sm text-ink-soft">Deleting an account, changing roles and downloading a backup need a code from your email. It works for 10 minutes, then we ask again.</p>
      {!sent ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={send} disabled={busy} className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-black disabled:opacity-60">{busy ? 'Sending…' : 'Email me a code'}</button>
          <button type="button" onClick={onCancel} className={buttonQuiet}>Cancel</button>
        </div>
      ) : (
        <form onSubmit={verify} className="mt-3">
          <p className="text-xs text-ink-soft">{sent}.</p>
          <label htmlFor="sudo-code" className="mt-2 block text-xs font-medium text-ink-soft">6-digit code</label>
          <div className="mt-1 flex flex-wrap gap-2">
            <input id="sudo-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus className={`${input.replace('w-full ', '')} w-32 font-mono tracking-widest`} />
            <button type="submit" disabled={busy || code.length !== 6} className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-black disabled:opacity-60">{busy ? 'Checking…' : 'Confirm'}</button>
            <button type="button" onClick={send} disabled={busy} className={buttonQuiet}>Send a new code</button>
            <button type="button" onClick={onCancel} className={buttonQuiet}>Cancel</button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-800">{error}</p>}
    </section>
  );
}

/** Visitor reports waiting for a decision. "Take down…" opens that owner's Manage row with the reason filled in. */
export function ReportsQueue({ reports, missingTable, busy, onTakeDown, onDismiss }: {
  reports: AdminReport[] | null;
  missingTable: boolean;
  busy: boolean;
  onTakeDown: (report: AdminReport) => void;
  onDismiss: (report: AdminReport) => void;
}) {
  const [showHandled, setShowHandled] = useState(false);
  if (missingTable) {
    return <p className="rounded-lg border border-rule bg-white p-4 text-sm text-ink-soft">Visitor reports need <span className="font-mono">supabase/migrations/009_reports_and_usage.sql</span>. Run it in Supabase.</p>;
  }
  if (!reports) return null;
  const open = reports.filter((r) => r.status === 'open');
  const handled = reports.filter((r) => r.status !== 'open');
  return (
    <section id="reports" aria-labelledby="reports-title" className="rounded-lg border border-rule bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-4 py-3">
        <div>
          <h3 id="reports-title" className="text-sm font-medium">Visitor reports {open.length > 0 && <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 font-mono text-xs text-red-800">{open.length} open</span>}</h3>
          <p className="mt-0.5 text-xs text-ink-soft">Sent with the flag button on public portfolios. Taking a portfolio down closes its reports.</p>
        </div>
        {handled.length > 0 && (
          <button type="button" aria-expanded={showHandled} onClick={() => setShowHandled((v) => !v)} className="text-xs font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline">
            {showHandled ? 'Hide handled' : `Show handled (${handled.length})`}
          </button>
        )}
      </div>
      {open.length === 0 && <p className="px-4 py-3 text-sm text-ink-soft">Nothing to review.</p>}
      <ul className="divide-y divide-rule">
        {[...open, ...(showHandled ? handled : [])].map((r) => (
          <li key={r.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-ink">
                {r.slug ? <a href={`/portfolio/${r.slug}?preview=true`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent underline-offset-2 hover:text-accent-dark hover:underline">/{r.slug}</a> : <span className="font-mono text-xs">deleted portfolio</span>}
                <span className="ml-2">{REPORT_REASON[r.reason] || r.reason}</span>
              </p>
              {r.details && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink-soft">“{r.details}”</p>}
              <p className="mt-1 font-mono text-[11px] text-ink-soft">
                {when(r.created_at)}
                {r.status === 'open' && r.from_same_reporter > 1 && ` · ${r.from_same_reporter} open reports from the same visitor`}
                {r.status !== 'open' && ` · ${r.status === 'actioned' ? 'taken down' : 'dismissed'}${r.resolved_at ? ` ${when(r.resolved_at)}` : ''}`}
              </p>
            </div>
            {r.status === 'open' && (
              <div className="flex shrink-0 gap-2">
                {r.owner_id != null && !r.taken_down && <button type="button" disabled={busy} onClick={() => onTakeDown(r)} className={buttonDanger}>Take down…</button>}
                <button type="button" disabled={busy} onClick={() => onDismiss(r)} className={buttonQuiet}>Dismiss</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

type Session = { device: string; last_active: string; expires_at: string };

/** Where an account is signed in, with a button to end every session. */
export function SessionsBox({ userId, isSelf, busy, onLogoutAll }: { userId: number; isSelf: boolean; busy: boolean; onLogoutAll: () => Promise<boolean> }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api.get<{ sessions: Session[] }>(`/api/users/${userId}/sessions`)
      .then((res) => { if (!cancelled) setSessions(res.data.sessions); })
      .catch(() => { if (!cancelled) setSessions([]); });
    return () => { cancelled = true; };
  }, [userId, version]);

  return (
    <section className="rounded-md border border-rule bg-white p-4">
      <h3 className="text-xs font-medium text-ink-soft">Signed in</h3>
      {!sessions && <p className="mt-2 text-sm text-ink-soft">Loading…</p>}
      {sessions && sessions.length === 0 && <p className="mt-2 text-sm text-ink-soft">Not signed in anywhere.</p>}
      {sessions && sessions.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {sessions.slice(0, 5).map((s, i) => (
            <li key={i} className="text-sm">
              <p className="truncate text-ink" title={s.device}>{s.device}</p>
              <p className="font-mono text-[11px] text-ink-soft">active {when(s.last_active)}</p>
            </li>
          ))}
          {sessions.length > 5 && <li className="text-xs text-ink-soft">and {sessions.length - 5} more</li>}
        </ul>
      )}
      {!isSelf && (
        <>
          <button type="button" disabled={busy || !sessions?.length} onClick={async () => { if (await onLogoutAll()) setVersion((v) => v + 1); }} className={`mt-3 ${buttonQuiet}`}>
            Log out everywhere
          </button>
          <p className="mt-1.5 text-xs text-ink-soft">Pages already open keep working for up to 15 minutes.</p>
        </>
      )}
    </section>
  );
}

/** `admin` is what every new account gets: an ordinary member who edits their own portfolio. */
export const ROLE_LABEL: Record<string, string> = { admin: 'Member', superadmin: 'Superadmin', user: 'No dashboard (old)' };

const SETTING_LABEL: Record<string, string> = { signupsOpen: 'sign-ups', aiEnabled: 'the AI assistant', announcement: 'the announcement', reservedSlugs: 'reserved slugs' };

/** One line of the admin activity log, in words. */
export function describeAction(entry: AdminActionEntry) {
  const target = entry.target_label || `user ${entry.target_user_id ?? '?'}`;
  const details = entry.details || {};
  switch (entry.action) {
    case 'role-change': return `changed ${target} from ${ROLE_LABEL[String(details.from)] || details.from} to ${ROLE_LABEL[String(details.to)] || details.to}`;
    case 'deactivate': return `deactivated ${target}`;
    case 'activate': return `reactivated ${target}`;
    case 'takedown': return `took down /portfolio/${target}${details.reason ? ` — “${details.reason}”` : ''}`;
    case 'restore': return `restored /portfolio/${target}`;
    case 'resend-verification': return `sent a verification link to ${target}`;
    case 'send-reset': return `sent a password reset link to ${target}`;
    case 'delete-account': return `deleted the account ${target}`;
    case 'force-logout': return `signed ${target} out everywhere`;
    case 'report-dismiss': return `dismissed a report about /portfolio/${target}`;
    case 'backup-download': return 'downloaded a backup';
    case 'settings-change': {
      const name = String(details.name);
      if (name === 'signupsOpen' || name === 'aiEnabled') return `turned ${details.to ? 'on' : 'off'} ${SETTING_LABEL[name]}`;
      if (name === 'announcement') return details.to ? 'set the announcement banner' : 'removed the announcement banner';
      return `changed ${SETTING_LABEL[name] || name}`;
    }
    case 'cleanup': {
      const n = (key: string, field = 'removed') => Number((details[key] as Record<string, unknown> | undefined)?.[field] ?? 0);
      return `removed ${n('rateLimits')} rate-limit rows, ${n('sessions')} sessions, ${n('resetTokens', 'cleared')} reset links and ${n('files')} unused files${details.failed ? ' (with errors)' : ''}`;
    }
    default: return `${entry.action} ${target}`;
  }
}
