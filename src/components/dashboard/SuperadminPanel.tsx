'use client';

import { useMemo, useState } from 'react';
import type { AdminStats, VercelLogEntry } from '@/types';

interface Props {
  adminStats: AdminStats | null;
  vercelLogs: VercelLogEntry[];
  vercelLogsLoading: boolean;
  vercelLogsError: string;
  fetchAdminStats: () => void;
  fetchVercelLogs: () => void;
}

const levelStyles: Record<string, string> = {
  error: 'text-red-700',
  warning: 'text-amber-700',
  info: 'text-ink-soft',
};

const levelDots: Record<string, string> = {
  error: 'bg-red-600',
  warning: 'bg-amber-500',
  info: 'bg-[#b0b0a8]',
};

export default function SuperadminPanel({ adminStats, vercelLogs, vercelLogsLoading, vercelLogsError, fetchAdminStats, fetchVercelLogs }: Props) {
  const [levelFilter, setLevelFilter] = useState('all');
  const visibleLogs = useMemo(
    () => levelFilter === 'all' ? vercelLogs : vercelLogs.filter((log) => log.level === levelFilter),
    [levelFilter, vercelLogs],
  );

  return (
    <div className="flex-1 overflow-auto bg-paper px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Server logs</h2>
            <p className="mt-1 text-sm text-ink-soft">Latest runtime events from the production deployment on Vercel.</p>
          </div>
          <button type="button" onClick={() => { fetchAdminStats(); fetchVercelLogs(); }} className="rounded-md border border-rule bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink-soft">
            Refresh
          </button>
        </div>
        {adminStats && (
          <dl className="grid grid-cols-2 rounded-lg border border-rule bg-white md:grid-cols-4">
            {[
              { label: 'Users', value: adminStats.users },
              { label: 'Portfolios', value: adminStats.portfolios },
              { label: 'Published', value: adminStats.published },
              { label: 'Messages', value: adminStats.messages },
            ].map((stat, index) => (
              <div key={stat.label} className={`px-5 py-4 ${index % 2 === 1 ? 'border-l border-rule' : ''} ${index >= 2 ? 'border-t border-rule md:border-t-0' : ''} ${index === 2 ? 'md:border-l' : ''}`}>
                <dt className="text-xs text-ink-soft">{stat.label}</dt>
                <dd className="mt-1 font-mono text-2xl tabular-nums text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <section className="overflow-hidden rounded-lg border border-rule bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3">
            <h3 className="text-sm font-medium">Events</h3>
            <div role="group" aria-label="Filter by level" className="flex overflow-hidden rounded-md border border-rule text-xs">
              {['all', 'error', 'warning', 'info'].map((level) => (
                <button key={level} type="button" aria-pressed={levelFilter === level} onClick={() => setLevelFilter(level)} className={`px-2.5 py-1 transition-colors ${levelFilter === level ? 'bg-paper-deep font-medium text-ink' : 'text-ink-soft hover:text-ink'}`}>
                  {level === 'all' ? 'All' : level[0].toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {vercelLogsLoading && <p className="p-6 text-sm text-ink-soft">Loading logs…</p>}
          {!vercelLogsLoading && vercelLogsError && <p role="alert" className="p-6 text-sm text-red-700">{vercelLogsError}</p>}
          {!vercelLogsLoading && !vercelLogsError && visibleLogs.length === 0 && <p className="p-6 text-sm text-ink-soft">No logs found.</p>}
          {!vercelLogsLoading && !vercelLogsError && visibleLogs.length > 0 && (
            <div className="divide-y divide-rule">
              {visibleLogs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1.5 px-4 py-3 md:flex-row md:items-start md:gap-4">
                  <span className={`inline-flex w-20 shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase ${levelStyles[log.level] || levelStyles.info}`}>
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${levelDots[log.level] || levelDots.info}`} />
                    {log.level}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm text-ink">{log.message}</p>
                    <p className="mt-1 font-mono text-[11px] text-ink-soft">{new Date(log.timestamp).toLocaleString()} · {log.route || log.deployment}{log.status ? ` · ${log.status}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
