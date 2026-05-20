import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getStudentProgress } from '../controllers/studentController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/progress', getStudentProgress);

export default router;
