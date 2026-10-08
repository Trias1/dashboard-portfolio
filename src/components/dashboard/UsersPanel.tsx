'use client';
import api from '@/lib/api';
import type { ManagedUser } from '@/types';

interface Props {
  users: ManagedUser[];
  fetchUsers: () => void;
}

export default function UsersPanel({ users, fetchUsers }: Props) {
  return (
    <div className="flex-1 overflow-auto bg-paper px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Users</h2>
            <p className="mt-1 text-sm text-ink-soft">Roles, access, and accounts. <span className="font-mono tabular-nums">{users.length}</span> total.</p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-rule bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-rule bg-paper">
                {['Name', 'Email', 'Role', 'Status', 'Verified', ''].map((h, index) => (
                  <th key={h || `col-${index}`} scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-ink-soft">{h || <span className="sr-only">Actions</span>}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-paper">
                  <td className="px-4 py-2.5 text-ink">{u.name}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <select aria-label={`Role for ${u.name || u.email}`} value={u.role} onChange={async e => { await api.patch(`/api/users/${u.id}/role`, { role: e.target.value }); fetchUsers(); }}
                      className="rounded-md border border-rule bg-white px-2 py-1 font-mono text-xs text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <button type="button" title="Click to switch" aria-label={`Toggle status for ${u.name || u.email}`} onClick={async () => { await api.patch(`/api/users/${u.id}/status`); fetchUsers(); }}
                      className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-ink hover:bg-paper-deep">
                      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-soft">
                    {u.is_verified ? 'Verified' : 'Unverified'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button type="button" aria-label={`Delete ${u.name || u.email}`} onClick={async () => {
                      if (!confirm(`Delete user ${u.name || u.email}?`)) return;
                      await api.delete(`/api/users/${u.id}`);
                      fetchUsers();
                    }} className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50">
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
