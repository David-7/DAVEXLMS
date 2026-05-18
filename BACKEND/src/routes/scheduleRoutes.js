import express from 'express';
import {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSchedules);
router.post('/', authorize('super_admin', 'admin', 'instructor'), createSchedule);
router.patch('/:scheduleId', authorize('super_admin', 'admin', 'instructor'), updateSchedule);
router.delete('/:scheduleId', authorize('super_admin', 'admin'), deleteSchedule);

export default router;
