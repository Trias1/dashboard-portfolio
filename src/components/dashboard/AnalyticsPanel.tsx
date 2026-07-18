'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

function VisitorChart({ data }: { data: any[] }) {
  const chartData = data.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    visitor: parseInt(d.count),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f0f2a', border: '1px solid #4c1d95', borderRadius: '8px', color: '#fff' }}
          labelStyle={{ color: '#a855f7', fontWeight: 'bold' }}
          formatter={(value: any) => [value, 'Visitor']}
        />
        <Area type="monotone" dataKey="visitor" stroke="#a855f7" strokeWidth={2} fill="url(#colorVisitor)" dot={{ fill: '#a855f7', r: 4 }} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface Props {
  visits: any;
  setVisits: (v: any) => void;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
}

export default function AnalyticsPanel({ visits, setVisits, dateFrom, dateTo, setDateFrom, setDateTo }: Props) {
  const fetchVisits = async (from?: string, to?: string) => {
    const f = from || dateFrom;
    const t = to || dateTo;
    const res = await api.get(`/api/portfolios/visits?from=${f}&to=${t}`);
    setVisits(res.data);
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6"> Statistik Portfolio</h2>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Dari:</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-[#0f0f2a] border border-purple-900/30 rounded-lg px-3 py-1.5 text-white text-xs"
              style={{ colorScheme: 'dark' }} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Sampai:</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-[#0f0f2a] border border-purple-900/30 rounded-lg px-3 py-1.5 text-white text-xs"
              style={{ colorScheme: 'dark' }} />
          </div>
          <button onClick={() => fetchVisits()}
            className="text-xs px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition">
             Tampilkan
          </button>
          {[{ label: '7 Hari', days: 7 }, { label: '30 Hari', days: 30 }, { label: '90 Hari', days: 90 }].map(s => (
            <button key={s.days} onClick={async () => {
              const from = new Date(); from.setDate(from.getDate() - s.days);
              const f = from.toISOString().slice(0, 10);
              const t = new Date().toISOString().slice(0, 10);
              setDateFrom(f); setDateTo(t);
              const res = await api.get(`/api/portfolios/visits?from=${f}&to=${t}`);
              setVisits(res.data);
            }} className="text-xs px-3 py-1.5 rounded-lg border border-purple-900/30 text-gray-400 hover:text-white hover:border-purple-500 transition">
              {s.label}
            </button>
          ))}
        </div>
        {visits ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Visitor', value: visits.total, icon: '' },
                { label: 'Hari Ini', value: visits.today, icon: '' },
                { label: '7 Hari Terakhir', value: visits.week, icon: '' },
              ].map((s, i) => (
                <div key={i} className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
            {visits.chart?.length > 0 && (
              <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Grafik Visitor</h3>
                <VisitorChart data={visits.chart} />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-3"></div>
            <p>Belum ada data visitor</p>
            <p className="text-xs mt-1">Publish portfolio kamu untuk mulai tracking</p>
          </div>
        )}
      </div>
    </div>
  );
}
