import api from '../api/axios';

export const announcementService = {
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  createAnnouncement: async (announcementData) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  deleteAnnouncement: async (announcementId) => {
    const response = await api.delete(`/announcements/${announcementId}`);
    return response.data;
  },
};

export default announcementService;
