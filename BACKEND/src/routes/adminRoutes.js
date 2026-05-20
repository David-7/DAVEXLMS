import express from 'express';
import {
  createStudent,
  createInstructor,
  updateStudent,
  updateInstructor,
  getAllStudents,
  getAllInstructors,
  blockUser,
  unblockUser,
  upgradeToPremium,
  getDashboardStats,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin', 'admin'));

router.post('/students', createStudent);
router.post('/instructors', createInstructor);
router.get('/students', getAllStudents);
router.get('/instructors', getAllInstructors);
router.patch('/students/:userId', updateStudent);
router.patch('/instructors/:userId', updateInstructor);
router.patch('/users/:userId/block', blockUser);
router.patch('/users/:userId/unblock', unblockUser);
router.patch('/users/:userId/upgrade-premium', upgradeToPremium);
router.delete('/users/:userId', deleteUser);
router.get('/dashboard/stats', getDashboardStats);

export default router;
