import type { Dispatch, FormEvent, SetStateAction } from 'react';
import api, { getApiErrorMessage, setToken, setUser as setApiUser } from '@/lib/api';
import type { DashboardUser, ProfileFormData, ProfileUpdateResponse } from '@/types';

interface ProfileActionsParams {
  user: DashboardUser | null;
  profileForm: ProfileFormData;
  setUser: Dispatch<SetStateAction<DashboardUser | null>>;
  setProfileForm: Dispatch<SetStateAction<ProfileFormData>>;
  setProfileMsg: (message: string) => void;
  setProfileError: (message: string) => void;
  router: { replace: (href: string) => void };
}

interface ProfileUpdatePayload {
  name: string;
  email: string;
  photo_url: string;
  password?: string;
  currentPassword?: string;
}

export function useDashboardProfileActions({ user, profileForm, setUser, setProfileForm, setProfileMsg, setProfileError, router }: ProfileActionsParams) {
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setToken(null);
      setApiUser(null);
      try {
        ['user', 'portfolio-sections', 'portfolio-theme'].forEach((key) => localStorage.removeItem(key));
      } catch {}
      setUser(null);
      router.replace('/login');
    }
  };
  const updateProfile = async (event: FormEvent) => {
    event.preventDefault(); setProfileMsg(''); setProfileError('');
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) { setProfileError('Passwords do not match'); return; }
    if (profileForm.password && profileForm.password.length < 8) { setProfileError('Password must be at least 8 characters'); return; }
    try {
      const payload: ProfileUpdatePayload = { name: profileForm.name, email: profileForm.email, photo_url: profileForm.photo_url };
      if (profileForm.password) payload.password = profileForm.password;
      if (profileForm.currentPassword) payload.currentPassword = profileForm.currentPassword;
      const response = await api.put<ProfileUpdateResponse>('/api/auth/profile', payload);
      const updatedUser: DashboardUser = { ...user, name: response.data.name, email: response.data.email, photo_url: response.data.photo_url };
      localStorage.setItem('user', JSON.stringify({ role: updatedUser.role, photo_url: updatedUser.photo_url, name: updatedUser.name }));
      setUser(updatedUser);
      setProfileForm((previous) => ({ ...previous, name: response.data.name, email: response.data.email, photo_url: response.data.photo_url || '', password: '', confirmPassword: '', currentPassword: '' }));
      setProfileMsg('Profile updated!');
    } catch (error) { setProfileError(getApiErrorMessage(error, 'Update failed')); }
  };
  return { logout, updateProfile };
}
