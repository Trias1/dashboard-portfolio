'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminOverviewPanel({ stats, onRefresh }: { stats: any; onRefresh: () => void }) {
  const templates = Object.entries(stats?.templateCounts || {}).map(([template, count]) => ({ template, count }));
  const cards = [
    ['Users', stats?.users ?? 0],
    ['Portfolios', stats?.portfolios ?? 0],
    ['Published', stats?.published ?? 0],
    ['Draft', stats?.draft ?? 0],
  ];
  const onlineUsers = stats?.onlineUsers || [];
  const offlineUsers = stats?.offlineUsers || [];

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold text-white">Overview / Analytics</h2><p className="mt-1 text-sm text-slate-400">Live portfolio data from the database.</p></div>
          <button type="button" onClick={onRefresh} className="rounded-lg border border-purple-900/30 px-4 py-2 text-xs text-slate-400 hover:text-white">Refresh</button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-purple-900/30 bg-[#0f0f2a] p-5"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value}</p></div>)}</div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-purple-900/30 bg-[#0f0f2a] p-5"><h3 className="mb-4 text-sm font-semibold text-white">Portfolios by template</h3>{templates.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={templates}><CartesianGrid stroke="#1e1b4b" strokeDasharray="3 3"/><XAxis dataKey="template" tick={{ fill: '#94a3b8', fontSize: 11 }}/><YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }}/><Tooltip contentStyle={{ background: '#0f0f2a', border: '1px solid #4c1d95' }}/><Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]}/></BarChart></ResponsiveContainer> : <p className="py-20 text-center text-sm text-slate-500">No portfolio data.</p>}</div>
          <div className="rounded-2xl border border-purple-900/30 bg-[#0f0f2a] p-5"><h3 className="mb-4 text-sm font-semibold text-white">Recent portfolios</h3><div className="divide-y divide-white/10">{(stats?.recentPortfolios || []).map((portfolio: any) => <div key={portfolio.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm text-white">{portfolio.title || portfolio.slug}</p><p className="text-xs text-slate-500">{portfolio.template || 'modern'} · {portfolio.slug}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[11px] ${portfolio.is_published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-400'}`}>{portfolio.is_published ? 'Published' : 'Draft'}</span></div>)}</div></div>
        </div>
        <div className="rounded-2xl border border-purple-900/30 bg-[#0f0f2a] p-5"><h3 className="text-sm font-semibold text-white">Presence</h3><div className="mt-4 grid grid-cols-2 gap-4"><div className="rounded-xl bg-emerald-500/10 p-4"><p className="text-xs text-emerald-300">Online now</p><p className="mt-1 text-2xl font-bold text-white">{stats?.usersOnline ?? 0}</p></div><div className="rounded-xl bg-slate-500/10 p-4"><p className="text-xs text-slate-400">Offline</p><p className="mt-1 text-2xl font-bold text-white">{stats?.usersOffline ?? 0}</p></div></div><div className="mt-5 grid gap-5 md:grid-cols-2"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">Online</p>{onlineUsers.length ? onlineUsers.map((user: any) => <div key={user.id} className="flex justify-between border-b border-white/10 py-2 text-sm"><div className="min-w-0"><p className="truncate text-white">{user.name || "Unnamed user"}</p><p className="truncate text-xs text-slate-500">{user.email}</p><p className="text-xs text-slate-600">Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p></div><span className="ml-3 text-xs text-emerald-300">Active now</span></div>) : <p className="text-sm text-slate-500">No users online.</p>}</div><div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Offline</p>{offlineUsers.length ? offlineUsers.slice(0, 10).map((user: any) => <div key={user.id} className="border-b border-white/10 py-2 text-sm"><p className="truncate text-white">{user.name || "Unnamed user"}</p><p className="truncate text-xs text-slate-500">{user.email}</p><p className="text-xs text-slate-600">Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p><p className="text-xs text-slate-500">{user.last_seen_at ? `Last seen ${new Date(user.last_seen_at).toLocaleString()}` : 'Never seen'}</p></div>) : <p className="text-sm text-slate-500">No users offline.</p>}</div></div></div>        <div className="rounded-2xl border border-purple-900/30 bg-[#0f0f2a] p-5"><h3 className="text-sm font-semibold text-white">Login devices</h3><div className="mt-4 divide-y divide-white/10">{[...onlineUsers, ...offlineUsers].slice(0, 10).map((user: any) => <div key={`device-${user.id}`} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm text-white">{user.name || "Unnamed user"}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{user.last_device || "Unknown device"}</span></div>)}</div></div>
      </div>
    </div>
  );
}
