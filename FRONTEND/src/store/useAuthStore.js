import { create } from 'zustand';
import { authService } from '../services/authService';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  refreshUser: async () => {
    try {
      const response = await api.get('/auth/profile');
      const updatedUser = response.data?.data || response.data?.user;
      if (updatedUser) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user profile');
      return null;
    }
  },

  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(identifier, password);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  activateAccount: async (identifier, password, confirmPassword) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.activateAccount(identifier, password, confirmPassword);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Activation failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
