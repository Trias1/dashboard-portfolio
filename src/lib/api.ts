import axios from 'axios';

let memoryToken: string | null = null;
/** Minimal user shape cached client-side; only `role` is persisted to localStorage. */
export interface ApiUser {
  role?: string;
}

let memoryUser: ApiUser | null = null;

export const setToken = (token: string | null) => { memoryToken = token; };
export const getToken = () => memoryToken;
export const getApiErrorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;
export const setUser = (user: ApiUser | null) => {
  memoryUser = user;
  if (user) localStorage.setItem('user', JSON.stringify({ role: user.role }));
  else localStorage.removeItem('user');
};
export const getUser = (): ApiUser | null => {
  if (memoryUser) return memoryUser;
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (memoryToken) config.headers.Authorization = `Bearer ${memoryToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isRefreshCall = typeof original?.url === 'string' && original.url.includes('/api/auth/refresh');
    if (error.response?.status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        memoryToken = res.data.accessToken;
        original.headers.Authorization = `Bearer ${memoryToken}`;
        return api(original);
      } catch {
        memoryToken = null;
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const initAuth = async (): Promise<boolean> => {
  try {
    const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
    memoryToken = res.data.accessToken;
    return true;
  } catch { memoryToken = null; return false; }
};

export default api;