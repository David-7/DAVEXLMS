import api from '../api/axios';

export const authService = {
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data.success) {
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      sessionStorage.setItem('isLoggedIn', 'true');
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
      sessionStorage.setItem('accessToken', response.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      sessionStorage.setItem('isLoggedIn', 'true');
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
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
    }
  },

  getCurrentUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('accessToken') && !!sessionStorage.getItem('isLoggedIn');
  },
};
