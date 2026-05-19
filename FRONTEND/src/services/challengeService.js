import api from '../api/axios';

export const challengeService = {
  getChallenges: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },

  getChallenge: async (challengeId) => {
    const response = await api.get(`/challenges/${challengeId}`);
    return response.data;
  },

  createChallenge: async (challengeData) => {
    const response = await api.post('/challenges', challengeData);
    return response.data;
  },

  updateChallenge: async (challengeId, challengeData) => {
    const response = await api.patch(`/challenges/${challengeId}`, challengeData);
    return response.data;
  },

  deleteChallenge: async (challengeId) => {
    const response = await api.delete(`/challenges/${challengeId}`);
    return response.data;
  },

  submitChallenge: async (challengeId, submissionData) => {
    const response = await api.post(`/challenges/${challengeId}/submit`, submissionData);
    return response.data;
  },

  evaluateSubmission: async (challengeId, submissionId, evaluationData) => {
    const response = await api.patch(`/challenges/${challengeId}/submissions/${submissionId}/evaluate`, evaluationData);
    return response.data;
  },
};

export default challengeService;
