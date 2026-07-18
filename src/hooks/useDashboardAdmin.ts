import { useCallback, useState } from 'react';
import api from '@/lib/api';

export function useDashboardAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [vercelLogs, setVercelLogs] = useState<any[]>([]);
  const [vercelLogsLoading, setVercelLogsLoading] = useState(false);
  const [vercelLogsError, setVercelLogsError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchAdminStats = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setAdminStats(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchVercelLogs = useCallback(async () => {
    setVercelLogsLoading(true);
    setVercelLogsError('');
    try {
      const response = await api.get('/api/admin/vercel-logs');
      setVercelLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      setVercelLogsError(error.response?.data?.message || 'Unable to load Vercel logs');
    } finally {
      setVercelLogsLoading(false);
    }
  }, []);

  return { users, adminStats, vercelLogs, vercelLogsLoading, vercelLogsError, fetchUsers, fetchAdminStats, fetchVercelLogs };
}
