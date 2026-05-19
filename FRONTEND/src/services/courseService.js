import api from '../api/axios';

export const courseService = {
  getCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  getCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (courseId, courseData) => {
    const response = await api.patch(`/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  addLesson: async (courseId, lessonData) => {
    const response = await api.post(`/courses/${courseId}/lessons`, lessonData);
    return response.data;
  },

  addResource: async (courseId, lessonId, resourceData) => {
    const response = await api.post(`/courses/${courseId}/lessons/${lessonId}/resources`, resourceData);
    return response.data;
  },

  markTopicCovered: async (courseId, lessonId, topicId) => {
    const response = await api.patch(`/courses/${courseId}/lessons/${lessonId}/topics/${topicId}/mark-covered`);
    return response.data;
  },

  unmarkTopicCovered: async (courseId, lessonId, topicId) => {
    const response = await api.patch(`/courses/${courseId}/lessons/${lessonId}/topics/${topicId}/unmark-covered`);
    return response.data;
  },
};

export default courseService;
