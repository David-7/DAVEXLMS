import api from '../api/axios';

export const adminService = {
  // Students
  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post('/admin/students', studentData);
    return response.data;
  },

  updateStudent: async (userId, studentData) => {
    const response = await api.patch(`/admin/students/${userId}`, studentData);
    return response.data;
  },

  deleteStudent: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/block`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  upgradeToPremium: async (userId) => {
    const response = await api.patch(`/admin/students/${userId}/upgrade-premium`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  // Instructors
  getInstructors: async () => {
    const response = await api.get('/admin/instructors');
    return response.data;
  },

  createInstructor: async (instructorData) => {
    const response = await api.post('/admin/instructors', instructorData);
    return response.data;
  },

  updateInstructor: async (userId, instructorData) => {
    const response = await api.patch(`/admin/instructors/${userId}`, instructorData);
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};

export default adminService;
