'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { AdminActionEntry } from '@/types';
import { describeAction, input } from '@/components/dashboard/UsersPanelParts';

const FILTERS = [
  { value: '', label: 'Everything' },
  { value: 'takedown', label: 'Takedowns' },
  { value: 'restore', label: 'Restores' },
  { value: 'delete-account', label: 'Deleted accounts' },
  { value: 'deactivate', label: 'Deactivations' },
  { value: 'role-change', label: 'Role changes' },
  { value: 'force-logout', label: 'Forced logouts' },
  { value: 'send-reset', label: 'Reset links sent' },
  { value: 'report-dismiss', label: 'Dismissed reports' },
  { value: 'settings-change', label: 'Settings changes' },
  { value: 'backup-download', label: 'Backups' },
  { value: 'cleanup', label: 'Daily cleanup' },
];

/** The admin log: who changed what, newest first, filterable by kind and searchable by account. */
export default function ActivityPanel() {
  const [action, setAction] = useState('');
  const [query, setQuery] = useState('');
  const [data, setData] = useState<{ entries: AdminActionEntry[]; missingTable: boolean } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get<{ entries: AdminActionEntry[]; missingTable: boolean }>('/api/admin/actions', { params: { limit: 200, action: action || undefined } })
      .then((res) => { if (!cancelled) { setData(res.data); setError(''); } })
      .catch((err) => { if (!cancelled) setError(getApiErrorMessage(err, 'The log could not be loaded.')); });
    return () => { cancelled = true; };
  }, [action]);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = data?.entries || [];
    return q ? all.filter((e) => [e.actor, e.target_label].some((v) => v?.toLowerCase().includes(q))) : all;
  }, [data, query]);

  return (
    <div className="flex-1 overflow-auto bg-paper px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Activity</h2>
            <p className="mt-1 text-sm text-ink-soft">Every change made from the admin panels, and each daily cleanup. The last 200 shown.</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <label htmlFor="activity-filter" className="sr-only">Kind of change</label>
            <select id="activity-filter" value={action} onChange={(e) => setAction(e.target.value)} className={`sm:w-48 ${input}`}>
              {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <label htmlFor="activity-search" className="sr-only">Search by admin or account</label>
            <input id="activity-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Admin, email or slug" className={`sm:w-56 ${input}`} />
          </div>
        </div>
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <section className="rounded-lg border border-rule bg-white">
          {!data && !error && <p className="p-4 text-sm text-ink-soft">Loading…</p>}
          {data?.missingTable && <p className="p-4 text-sm text-ink-soft">Not recording yet: run <span className="font-mono">supabase/migrations/008_moderation_and_admin_log.sql</span> in Supabase.</p>}
          {data && !data.missingTable && entries.length === 0 && <p className="p-4 text-sm text-ink-soft">Nothing here{query || action ? ' for this filter' : ' yet'}.</p>}
          {entries.length > 0 && (
            <ul className="divide-y divide-rule">
              {entries.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="w-36 shrink-0 font-mono text-[11px] text-ink-soft">{new Date(entry.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-sm text-ink"><span className="font-medium">{entry.actor}</span> {describeAction(entry)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
