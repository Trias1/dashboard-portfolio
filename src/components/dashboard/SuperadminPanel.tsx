'use client';

import { useMemo, useState } from 'react';

interface Props {
  adminStats: any;
  vercelLogs: any[];
  vercelLogsLoading: boolean;
  vercelLogsError: string;
  fetchAdminStats: () => void;
  fetchVercelLogs: () => void;
}

const levelStyles: Record<string, string> = {
  error: 'bg-red-500/15 text-red-300',
  warning: 'bg-yellow-500/15 text-yellow-300',
  info: 'bg-blue-500/15 text-blue-300',
};

export default function SuperadminPanel({ adminStats, vercelLogs, vercelLogsLoading, vercelLogsError, fetchAdminStats, fetchVercelLogs }: Props) {
  const [levelFilter, setLevelFilter] = useState('all');
  const visibleLogs = useMemo(
    () => levelFilter === 'all' ? vercelLogs : vercelLogs.filter((log) => log.level === levelFilter),
    [levelFilter, vercelLogs],
  );

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Vercel Logs</h2>
            <p className="text-sm text-gray-400 mt-1">Latest runtime events for the production deployment.</p>
          </div>
          <button onClick={() => { fetchAdminStats(); fetchVercelLogs(); }} className="text-xs px-4 py-2 rounded-lg border border-purple-900/30 text-gray-400 hover:text-white transition">
            Refresh
          </button>
        </div>
        {adminStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: adminStats.users, icon: 'US' },
              { label: 'Total Portfolios', value: adminStats.portfolios, icon: 'PF' },
              { label: 'Published', value: adminStats.published, icon: 'PB' },
              { label: 'Messages', value: adminStats.messages, icon: 'IN' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-5 text-center">
                <div className="text-xs font-bold tracking-widest text-purple-300 mb-2" aria-hidden="true">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl overflow-hidden">
          <div className="flex gap-2 p-4 border-b border-purple-900/20">
            {['all', 'error', 'warning', 'info'].map((level) => (
              <button key={level} onClick={() => setLevelFilter(level)} className={`rounded-full px-3 py-1 text-xs ${levelFilter === level ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                {level === 'all' ? 'All' : level[0].toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          {vercelLogsLoading && <p className="p-6 text-sm text-gray-400">Loading Vercel logs...</p>}
          {!vercelLogsLoading && vercelLogsError && <p className="p-6 text-sm text-red-300">{vercelLogsError}</p>}
          {!vercelLogsLoading && !vercelLogsError && visibleLogs.length === 0 && <p className="p-6 text-sm text-gray-400">No Vercel logs found.</p>}
          {!vercelLogsLoading && !vercelLogsError && visibleLogs.length > 0 && (
            <div className="divide-y divide-purple-900/20">
              {visibleLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
                  <span className={`rounded-full px-2 py-1 text-[11px] uppercase ${levelStyles[log.level] || levelStyles.info}`}>{log.level}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-200 break-words">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()} · {log.route || log.deployment}{log.status ? ` · ${log.status}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
