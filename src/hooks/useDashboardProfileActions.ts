import api, { setToken } from '@/lib/api';

export function useDashboardProfileActions({ user, profileForm, setUser, setProfileForm, setProfileMsg, setProfileError, router }: any) {
  const logout = async () => {
    await api.post('/api/auth/logout');
    setToken(null);
    setUser(null);
    router.push('/login');
  };
  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault(); setProfileMsg(''); setProfileError('');
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) { setProfileError('Passwords do not match'); return; }
    try {
      const payload: any = { name: profileForm.name, email: profileForm.email, photo_url: profileForm.photo_url };
      if (profileForm.password) payload.password = profileForm.password;
      const response = await api.put('/api/auth/profile', payload);
      const updatedUser = { ...user, name: response.data.name, email: response.data.email, photo_url: response.data.photo_url };
      localStorage.setItem('user', JSON.stringify({ role: updatedUser.role, photo_url: updatedUser.photo_url, name: updatedUser.name }));
      setUser(updatedUser);
      setProfileForm((previous: any) => ({ ...previous, name: response.data.name, email: response.data.email, photo_url: response.data.photo_url || '' }));
      setProfileMsg('Profile updated!');
    } catch (error: any) { setProfileError(error.response?.data?.message || 'Update failed'); }
  };
  return { logout, updateProfile };
}
