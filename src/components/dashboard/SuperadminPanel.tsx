'use client';

interface Props {
  adminStats: any;
  resources: any;
  fetchAdminStats: () => void;
  fetchResources: () => void;
}

export default function SuperadminPanel({ adminStats, resources, fetchAdminStats, fetchResources }: Props) {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6"> Server Monitor</h2>
        {adminStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: adminStats.users, icon: '' },
              { label: 'Total Portfolio', value: adminStats.portfolios, icon: '' },
              { label: 'Published', value: adminStats.published, icon: '' },
              { label: 'Pesan Masuk', value: adminStats.messages, icon: '' },
            ].map((s, i) => (
              <div key={i} className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-5 text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {resources && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4"> CPU</h3>
              <p className="text-xs text-gray-400 mb-2">{resources.cpu.brand}</p>
              <p className="text-xs text-gray-400 mb-3">{resources.cpu.cores} cores @ {resources.cpu.speed}GHz</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${resources.cpu.load}%`, backgroundColor: resources.cpu.load > 80 ? '#ef4444' : resources.cpu.load > 50 ? '#f59e0b' : '#22c55e' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{resources.cpu.load}% used</p>
            </div>
            <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4"> Memory</h3>
              <p className="text-xs text-gray-400 mb-3">{(resources.memory.used / 1024 / 1024 / 1024).toFixed(1)}GB / {(resources.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${resources.memory.percent}%`, backgroundColor: resources.memory.percent > 80 ? '#ef4444' : resources.memory.percent > 60 ? '#f59e0b' : '#22c55e' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{resources.memory.percent}% used</p>
            </div>
            <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4"> Storage</h3>
              {resources.disk.map((d: any, i: number) => (
                <div key={i}>
                  <p className="text-xs text-gray-400 mb-3">{(d.used / 1024 / 1024 / 1024).toFixed(1)}GB / {(d.size / 1024 / 1024 / 1024).toFixed(1)}GB</p>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${d.percent}%`, backgroundColor: d.percent > 80 ? '#ef4444' : d.percent > 60 ? '#f59e0b' : '#22c55e' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{d.percent}% used</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={() => { fetchAdminStats(); fetchResources(); }}
          className="text-xs px-4 py-2 rounded-lg border border-purple-900/30 text-gray-400 hover:text-white transition">
           Refresh
        </button>
      </div>
    </div>
  );
}
