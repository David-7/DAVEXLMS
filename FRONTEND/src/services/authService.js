import api from '../api/axios';

export const authService = {
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  activateAccount: async (identifier, password, confirmPassword) => {
    const response = await api.post('/auth/activate', {
      identifier,
      password,
      confirmPassword,
    });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  requestPasswordReset: async (email, identifier) => {
    const response = await api.post('/auth/password-reset/request', {
      email,
      identifier,
    });
    return response.data;
  },

  resetPassword: async (resetToken, password, confirmPassword) => {
    const response = await api.post('/auth/password-reset/reset', {
      resetToken,
      password,
      confirmPassword,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};
