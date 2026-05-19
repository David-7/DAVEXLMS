import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

router.use(protect);

router.get('/my-certificates', authorize('student'), asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    student: req.user._id,
    isDeleted: false,
  })
    .populate('course', 'name')
    .populate('issuedBy', 'fullName')
    .sort({ issuedDate: -1 });

  res.status(200).json({
    success: true,
    data: certificates,
  });
}));

router.post('/', authorize('instructor', 'admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { student, course, title, description, certificateUrl, certificateType } = req.body;

  const certificate = await Certificate.create({
    student,
    course,
    title,
    description,
    certificateUrl,
    certificateType: certificateType || 'completion',
    issuedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Certificate created successfully',
    data: certificate,
  });
}));

export default router;
