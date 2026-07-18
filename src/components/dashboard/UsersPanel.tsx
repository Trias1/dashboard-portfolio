'use client';
import api from '@/lib/api';

interface Props {
  users: any[];
  fetchUsers: () => void;
}

export default function UsersPanel({ users, fetchUsers }: Props) {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6"> User Management</h2>
        <div className="bg-[#0f0f2a] border border-purple-900/30 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-900/30">
                {['Name', 'Email', 'Role', 'Status', 'Verified', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-400 text-sm font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition">
                  <td className="p-4 text-white text-sm">{u.name}</td>
                  <td className="p-4 text-gray-400 text-sm">{u.email}</td>
                  <td className="p-4">
                    <select aria-label={`Role for ${u.name || u.email}`} value={u.role} onChange={async e => { await api.patch(`/api/users/${u.id}/role`, { role: e.target.value }); fetchUsers(); }}
                      className="bg-[#1a1a3a] border border-purple-900/30 rounded-lg px-2 py-1 text-white text-xs">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button type="button" aria-label={`Toggle status for ${u.name || u.email}`} onClick={async () => { await api.patch(`/api/users/${u.id}/status`); fetchUsers(); }}
                      className={`text-xs px-3 py-1 rounded-full ${u.is_active ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${u.is_verified ? 'bg-blue-600/30 text-blue-300' : 'bg-gray-600/30 text-gray-400'}`}>
                      {u.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button type="button" aria-label={`Delete ${u.name || u.email}`} onClick={async () => {
                      if (!confirm(`Delete user ${u.name || u.email}?`)) return;
                      await api.delete(`/api/users/${u.id}`);
                      fetchUsers();
                    }} className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/15 hover:text-red-200 transition">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
