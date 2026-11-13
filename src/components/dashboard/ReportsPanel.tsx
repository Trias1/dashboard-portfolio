'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { AdminReport } from '@/types';
import { buttonDanger, buttonQuiet, input, ReportsQueue, REPORT_REASON } from '@/components/dashboard/UsersPanelParts';

/** Visitor reports as their own page: review, take the portfolio down with the report as the reason, or dismiss. */
export default function ReportsPanel({ onChanged }: { onChanged?: () => void }) {
  const [data, setData] = useState<{ reports: AdminReport[]; missingTable: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [takedown, setTakedown] = useState<{ report: AdminReport; reason: string } | null>(null);

  const load = useCallback(async () => {
    try { setData((await api.get<{ reports: AdminReport[]; missingTable: boolean }>('/api/admin/reports')).data); }
    catch (err) { setError(getApiErrorMessage(err, 'Reports could not be loaded.')); }
  }, []);
  useEffect(() => {
    let cancelled = false;
    api.get<{ reports: AdminReport[]; missingTable: boolean }>('/api/admin/reports')
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch((err) => { if (!cancelled) setError(getApiErrorMessage(err, 'Reports could not be loaded.')); });
    return () => { cancelled = true; };
  }, []);

  const run = async (action: () => Promise<{ data: { message?: string } }>) => {
    setBusy(true); setError(''); setNotice('');
    try { setNotice((await action()).data.message || 'Saved.'); setTakedown(null); }
    catch (err) { setError(getApiErrorMessage(err, 'That change could not be saved.')); }
    finally { setBusy(false); await load(); onChanged?.(); }
  };

  return (
    <div className="flex-1 overflow-auto bg-paper px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="mt-1 text-sm text-ink-soft">What visitors flagged on public portfolios. Reports are anonymous; only a scrambled IP is kept, to spot one person sending many.</p>
        </div>
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p>}

        {takedown && (
          <section aria-labelledby="takedown-title" className="rounded-lg border border-red-200 bg-white p-4">
            <h3 id="takedown-title" className="text-sm font-medium">Take down /portfolio/{takedown.report.slug}</h3>
            <p className="mt-1 text-sm text-ink-soft">It disappears for everyone but its owner. They see this reason in their dashboard and can&apos;t publish again until you restore it (Users → Manage).</p>
            <label htmlFor="takedown-reason" className="mt-3 block text-xs font-medium text-ink-soft">Reason (shown to the owner)</label>
            <textarea id="takedown-reason" rows={2} maxLength={300} value={takedown.reason} onChange={(e) => setTakedown({ ...takedown, reason: e.target.value })} className={`mt-1 resize-none ${input}`} />
            <div className="mt-3 flex gap-2">
              <button type="button" disabled={busy || !takedown.reason.trim()} className={buttonDanger}
                onClick={() => run(() => api.post(`/api/users/${takedown.report.owner_id}/actions`, { action: 'takedown', reason: takedown.reason }))}>
                Take down
              </button>
              <button type="button" onClick={() => setTakedown(null)} className={buttonQuiet}>Cancel</button>
            </div>
          </section>
        )}

        {!data && !error && <p className="text-sm text-ink-soft">Loading…</p>}
        <ReportsQueue reports={data?.reports ?? null} missingTable={!!data?.missingTable} busy={busy}
          onTakeDown={(report) => {
            setTakedown({ report, reason: `Reported: ${REPORT_REASON[report.reason] || report.reason}${report.details ? ` — ${report.details}` : ''}`.slice(0, 300) });
            window.setTimeout(() => document.getElementById('takedown-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
          }}
          onDismiss={(r) => run(() => api.post('/api/admin/reports', { id: r.id, action: 'dismiss' }))} />
      </div>
    </div>
  );
}
