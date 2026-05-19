import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  markTopicCovered,
  addResource,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllCourses);
router.get('/:courseId', getCourseById);

router.post('/', authorize('super_admin', 'admin'), createCourse);
router.patch('/:courseId', authorize('super_admin', 'admin'), updateCourse);
router.delete('/:courseId', authorize('super_admin', 'admin'), deleteCourse);

router.post('/:courseId/lessons', authorize('super_admin', 'admin', 'instructor'), addLesson);
router.patch(
  '/:courseId/lessons/:lessonId/topics/:topicId/mark-covered',
  authorize('super_admin', 'admin', 'instructor'),
  markTopicCovered
);
router.patch(
  '/:courseId/lessons/:lessonId/topics/:topicId/unmark-covered',
  authorize('super_admin', 'admin', 'instructor'),
  markTopicCovered
);
router.post(
  '/:courseId/lessons/:lessonId/resources',
  authorize('super_admin', 'admin', 'instructor'),
  addResource
);

export default router;
