'use client';
import { Fragment, useMemo, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import { visibilityStatus } from '@/lib/portfolio-visibility';
import type { ManagedUser } from '@/types';
import { buttonDanger, buttonQuiet, day, input, ROLE_LABEL, SessionsBox, SudoPrompt } from '@/components/dashboard/UsersPanelParts';

interface Props {
  users: ManagedUser[];
  fetchUsers: () => void;
  /** The signed-in superadmin, so their own row can't be signed out from here. */
  currentUserId?: number;
}

type Action = () => Promise<unknown>;

const STATUS: Record<ReturnType<typeof visibilityStatus>, { label: string; dot: string }> = {
  live: { label: 'Live', dot: 'bg-emerald-600' },
  draft: { label: 'Draft', dot: 'bg-[#b0b0a8]' },
  'taken-down': { label: 'Taken down', dot: 'bg-red-600' },
  'owner-inactive': { label: 'Hidden (inactive)', dot: 'bg-amber-500' },
  none: { label: 'No portfolio', dot: 'bg-[#b0b0a8]' },
};

function ago(value?: string | null) {
  if (!value) return 'never';
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 5) return 'online';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 48 * 60) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 1440)} d ago`;
}

export default function UsersPanel({ users, fetchUsers, currentUserId }: Props) {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  // An action the server refused until the admin confirms with an emailed code; re-run once confirmed.
  const [pendingSudo, setPendingSudo] = useState<{ action: Action; done?: string } | null>(null);

  // Every change goes through here: show the server's message, then reload the list.
  const run = async (action: Action, done?: string) => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const res = await action() as { data?: { message?: unknown } } | undefined;
      const message = res?.data?.message;
      setNotice(typeof message === 'string' && message ? message : done || 'Saved.');
      setPendingSudo(null);
      return true;
    } catch (err) {
      const data = (err as { response?: { data?: { needsSudo?: boolean } } })?.response?.data;
      if (data?.needsSudo) {
        setPendingSudo({ action, done });
        return false;
      }
      setError(getApiErrorMessage(err, 'That change could not be saved. Try again.'));
      return false;
    } finally {
      setBusy(false);
      fetchUsers();
    }
  };

  const toggle = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
    setReason('');
    setConfirmEmail('');
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.name, u.email, u.portfolio?.slug].some((value) => value?.toLowerCase().includes(q)));
  }, [users, query]);

  return (
    <div className="flex-1 overflow-auto bg-paper px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Users</h2>
            <p className="mt-1 text-sm text-ink-soft">Accounts and their portfolios. <span className="font-mono tabular-nums">{users.length}</span> total.</p>
          </div>
          <div className="w-full sm:w-72">
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <input id="user-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or slug" className={input} />
          </div>
        </div>

        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p>}
        {pendingSudo && (
          <SudoPrompt onCancel={() => setPendingSudo(null)} onConfirmed={() => { const pending = pendingSudo; setPendingSudo(null); void run(pending.action, pending.done); }} />
        )}

        <div className="overflow-x-auto rounded-lg border border-rule bg-white">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-rule bg-paper">
                {['Account', 'Portfolio', 'Role', 'Status', 'Joined · seen', ''].map((h, index) => (
                  <th key={h || `col-${index}`} scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-ink-soft">{h || <span className="sr-only">Actions</span>}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {visible.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-soft">{users.length ? 'No account matches that search.' : 'Loading accounts…'}</td></tr>
              )}
              {visible.map((u) => {
                const status = STATUS[visibilityStatus(u.portfolio, u.is_active)];
                const open = openId === u.id;
                const label = u.name || u.email;
                return (
                  <Fragment key={u.id}>
                    <tr className={open ? 'bg-paper' : 'transition-colors hover:bg-paper'}>
                      <td className="px-4 py-2.5">
                        <p className="text-ink">{u.name || '—'}</p>
                        <p className="text-xs text-ink-soft">{u.email}{!u.is_verified && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-900">Unverified</span>}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        {u.portfolio ? (
                          <a href={`/portfolio/${u.portfolio.slug}${u.portfolio.is_published && !u.portfolio.taken_down_at && u.is_active ? '' : '?preview=true'}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent underline-offset-2 hover:text-accent-dark hover:underline">
                            /{u.portfolio.slug}
                          </a>
                        ) : null}
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <select aria-label={`Role for ${label}`} value={u.role} disabled={busy} onChange={(e) => {
                          const role = e.target.value;
                          // Superadmin can see and change every account: confirm first (the select snaps back if cancelled)
                          if (!window.confirm(`Change ${label} from ${ROLE_LABEL[u.role] || u.role} to ${ROLE_LABEL[role]}?`)) return;
                          run(() => api.patch(`/api/users/${u.id}`, { role }), 'Role changed.');
                        }}
                          className="rounded-md border border-rule bg-white px-2 py-1 text-xs text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10">
                          <option value="admin">Member</option>
                          <option value="superadmin">Superadmin</option>
                          {u.role === 'user' && <option value="user" disabled>{ROLE_LABEL.user}</option>}
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <button type="button" disabled={busy} title={u.is_active ? 'Click to deactivate' : 'Click to activate'} aria-label={`${u.is_active ? 'Deactivate' : 'Activate'} ${label}`} onClick={() => {
                          if (u.is_active && !window.confirm(`Deactivate ${label}? They can't log in, and their portfolio is hidden until you reactivate them.`)) return;
                          run(() => api.patch(`/api/users/${u.id}`, { is_active: !u.is_active }), u.is_active ? 'Account deactivated.' : 'Account reactivated.');
                        }}
                          className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-ink hover:bg-paper-deep disabled:opacity-50">
                          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">{day(u.created_at)} · {ago(u.last_seen_at)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button type="button" aria-expanded={open} aria-controls={`manage-${u.id}`} onClick={() => toggle(u.id)} className={buttonQuiet}>
                          {open ? 'Close' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr id={`manage-${u.id}`} className="bg-paper">
                        <td colSpan={6} className="px-4 pb-5 pt-1">
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <section className="rounded-md border border-rule bg-white p-4">
                              <h3 className="text-xs font-medium text-ink-soft">Portfolio</h3>
                              {!u.portfolio && <p className="mt-2 text-sm text-ink-soft">No portfolio yet.</p>}
                              {u.portfolio?.taken_down_at && (
                                <>
                                  <p className="mt-2 text-sm text-ink">Taken down {day(u.portfolio.taken_down_at)}.</p>
                                  {u.portfolio.takedown_reason && <p className="mt-1 text-sm text-ink-soft">Reason: {u.portfolio.takedown_reason}</p>}
                                  <button type="button" disabled={busy} onClick={() => run(() => api.post(`/api/users/${u.id}/actions`, { action: 'restore' }))} className={`mt-3 ${buttonQuiet}`}>
                                    Restore portfolio
                                  </button>
                                </>
                              )}
                              {u.portfolio && !u.portfolio.taken_down_at && (
                                <>
                                  <p className="mt-2 text-sm text-ink-soft">Hide it from everyone. The owner sees your reason and can&apos;t publish again until you restore it.</p>
                                  <label htmlFor={`reason-${u.id}`} className="mt-3 block text-xs font-medium text-ink-soft">Reason (shown to the owner)</label>
                                  <input id={`reason-${u.id}`} value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} placeholder="e.g. spam links in the projects section" className={`mt-1 ${input}`} />
                                  <button type="button" disabled={busy || !reason.trim()} onClick={async () => {
                                    if (await run(() => api.post(`/api/users/${u.id}/actions`, { action: 'takedown', reason }))) setReason('');
                                  }} className={`mt-3 ${buttonDanger}`}>
                                    Take down
                                  </button>
                                </>
                              )}
                            </section>

                            <section className="rounded-md border border-rule bg-white p-4">
                              <h3 className="text-xs font-medium text-ink-soft">Help them sign in</h3>
                              <p className="mt-2 text-sm text-ink-soft">Mails a link to <span className="text-ink">{u.email}</span>.</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button type="button" disabled={busy} onClick={() => run(() => api.post(`/api/users/${u.id}/actions`, { action: 'send-reset' }))} className={buttonQuiet}>
                                  Send password reset link
                                </button>
                                {!u.is_verified && (
                                  <button type="button" disabled={busy} onClick={() => run(() => api.post(`/api/users/${u.id}/actions`, { action: 'resend-verification' }))} className={buttonQuiet}>
                                    Resend verification
                                  </button>
                                )}
                              </div>
                            </section>

                            <SessionsBox userId={u.id} isSelf={u.id === currentUserId} busy={busy}
                              onLogoutAll={() => run(() => api.post(`/api/users/${u.id}/actions`, { action: 'logout-all' }))} />

                            <section className="rounded-md border border-red-200 bg-white p-4">
                              <h3 className="text-xs font-medium text-red-800">Delete account</h3>
                              <p className="mt-2 text-sm text-ink-soft">Removes the account, its portfolio, messages, visits and uploaded files. This can&apos;t be undone.</p>
                              <label htmlFor={`confirm-${u.id}`} className="mt-3 block text-xs font-medium text-ink-soft">Type <span className="font-mono text-ink">{u.email}</span> to confirm</label>
                              <input id={`confirm-${u.id}`} value={confirmEmail} autoComplete="off" spellCheck={false} onChange={(e) => setConfirmEmail(e.target.value)} className={`mt-1 font-mono ${input}`} />
                              <button type="button" disabled={busy || confirmEmail.trim().toLowerCase() !== u.email.toLowerCase()} onClick={async () => {
                                if (await run(() => api.delete(`/api/users/${u.id}`, { data: { confirm_email: confirmEmail.trim() } }), 'Account deleted.')) setOpenId(null);
                              }} className={`mt-3 ${buttonDanger}`}>
                                Delete permanently
                              </button>
                            </section>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
