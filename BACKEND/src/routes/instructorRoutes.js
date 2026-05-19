import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

router.use(protect);
router.use(authorize('instructor'));

router.get('/students', asyncHandler(async (req, res) => {
  const students = await User.find({
    role: 'student',
    assignedInstructor: req.user._id,
    isDeleted: false,
  })
    .populate('assignedCourse', 'name')
    .select('-password -refreshToken')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: students,
  });
}));

export default router;
