'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { AdminHealth } from '@/types';

const card = 'rounded-lg border border-rule bg-white';

const bytes = (n: number) => {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.round(n / 1024)} KB`;
};
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Share of a free-plan limit. The fill turns amber at 70% and red at 90%; the numbers are always printed. */
function Meter({ label, used, limit, note }: { label: string; used: number; limit: number; note?: string }) {
  const share = Math.min(used / limit, 1);
  const pct = Math.round(share * 100);
  const fill = share >= 0.9 ? '#d03b3b' : share >= 0.7 ? '#fab219' : '#1f45c9';
  const state = share >= 0.9 ? 'Almost full' : share >= 0.7 ? 'Getting full' : null;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-ink">{label}</p>
        <p className="font-mono text-xs text-ink-soft">{bytes(used)} of {bytes(limit)} · {pct}%</p>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${bytes(used)} of ${bytes(limit)}, ${pct}%`}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e3e8f7]">
        <div className="h-full rounded-full" style={{ width: `${Math.max(share * 100, used > 0 ? 1 : 0)}%`, backgroundColor: fill }} />
      </div>
      {(state || note) && <p className="mt-1 text-xs text-ink-soft">{state ? <span className="font-medium text-ink">{state}. </span> : null}{note}</p>}
    </div>
  );
}

/** Up / down with an icon and a word, never colour alone. */
function Check({ name, result, off }: { name: string; result: { ok: boolean; ms: number; error: string | null } | null; off: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <p className="text-sm text-ink">{name}</p>
      {!result ? <p className="text-xs text-ink-soft">{off}</p> : result.ok ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-ink"><span aria-hidden="true" className="text-[#0a7f0a]">●</span>Up <span className="font-mono text-ink-soft">{result.ms} ms</span></p>
      ) : (
        <p className="max-w-[60%] text-right text-xs text-red-800"><span aria-hidden="true">✕ </span>Down<span className="block font-mono text-[11px] text-ink-soft">{result.error}</span></p>
      )}
    </div>
  );
}

function cleanupSummary(report: Record<string, unknown> | null) {
  const step = (key: string) => (report?.[key] as { removed?: number; cleared?: number; error?: string; skipped?: string } | undefined) || {};
  const parts = [
    `${step('rateLimits').removed ?? 0} rate-limit rows`,
    `${step('sessions').removed ?? 0} expired sessions`,
    `${step('resetTokens').cleared ?? 0} reset links`,
    `${step('files').removed ?? 0} unused files`,
  ];
  const problems = ['rateLimits', 'sessions', 'resetTokens', 'files'].map((k) => step(k).error || step(k).skipped).filter(Boolean);
  return { text: `Removed ${parts.join(', ')}.`, problems };
}

export default function AdminHealthSection({ onOpenReports }: { onOpenReports?: () => void }) {
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setHealth((await api.get<AdminHealth>('/api/admin/health')).data); }
    catch (err) { setError(getApiErrorMessage(err, 'Health checks could not run.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let cancelled = false;
    api.get<AdminHealth>('/api/admin/health')
      .then((res) => { if (!cancelled) setHealth(res.data); })
      .catch((err) => { if (!cancelled) setError(getApiErrorMessage(err, 'Health checks could not run.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const cleanup = health?.lastCleanup ? cleanupSummary(health.lastCleanup.report) : null;

  return (
    <section aria-labelledby="health-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="health-title" className="font-display text-lg font-semibold tracking-tight">Health</h3>
          <p className="text-xs text-ink-soft">{health ? `Checked ${when(health.checkedAt)}` : 'Free-plan usage and the services the app depends on.'}</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="rounded-md border border-rule bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink-soft disabled:opacity-50">
          {loading ? 'Checking…' : 'Check again'}
        </button>
      </div>
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {health && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={`${card} space-y-4 p-5`}>
            <h4 className="text-sm font-medium">Supabase free plan</h4>
            {health.usage ? (
              <>
                <Meter label="Database" used={health.usage.db.used} limit={health.usage.db.limit} />
                <Meter label="File storage" used={health.usage.storage.used} limit={health.usage.storage.limit} note={`${health.usage.storage.files} files`} />
              </>
            ) : (
              <p className="text-sm text-ink-soft">Run <span className="font-mono">supabase/migrations/009_reports_and_usage.sql</span> in Supabase to see usage.</p>
            )}
          </div>
          <div className={`${card} p-5`}>
            <h4 className="text-sm font-medium">Services</h4>
            <div className="mt-1 divide-y divide-rule">
              <Check name={`AI provider${health.ai && !health.ai.enabled ? ' (hidden from visitors)' : ''}`} result={health.ai} off="Not configured" />
              <Check name="Mail (Gmail SMTP)" result={health.mail} off="Not configured" />
              <div className="flex items-start justify-between gap-3 py-2.5">
                <p className="text-sm text-ink">Daily cleanup</p>
                <div className="max-w-[65%] text-right text-xs">
                  {cleanup && health.lastCleanup ? (
                    <>
                      <p className="text-ink">{when(health.lastCleanup.at)}</p>
                      <p className="text-ink-soft">{cleanup.text}</p>
                      {cleanup.problems.length > 0 && <p className="text-red-800">{cleanup.problems.join('; ')}</p>}
                    </>
                  ) : <p className="text-ink-soft">No run recorded yet (runs at 02:00 WIB)</p>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-sm text-ink">Visitor reports</p>
                {health.openReports === null ? <p className="text-xs text-ink-soft">Needs migration 009</p> : health.openReports > 0 ? (
                  <button type="button" onClick={onOpenReports} className="text-xs font-medium text-accent underline-offset-2 hover:text-accent-dark hover:underline">
                    {health.openReports} open — review
                  </button>
                ) : <p className="text-xs text-ink-soft">None open</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
