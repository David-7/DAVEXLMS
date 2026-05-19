import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/progress', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
  });
}));

export default router;
