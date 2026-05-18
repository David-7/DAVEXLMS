import User from '../models/User.js';
import Course from '../models/Course.js';
import Challenge from '../models/Challenge.js';
import FlashPrize from '../models/FlashPrize.js';
import Announcement from '../models/Announcement.js';
import Schedule from '../models/Schedule.js';
import Attendance from '../models/Attendance.js';
import ActivityLog from '../models/ActivityLog.js';
import Leaderboard from '../models/Leaderboard.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { generateAccountNumber, paginate, buildPaginationResponse } from '../utils/helpers.js';
import { validateAdmissionNumber, validateEmail } from '../middleware/validator.js';
import { logActivity, getClientInfo } from '../utils/activityLogger.js';

export const createStudent = asyncHandler(async (req, res, next) => {
  const {
    fullName,
    email,
    admissionNumber,
    amountPaid,
    transactionId,
    assignedCourse,
    assignedInstructor,
  } = req.body;

  if (!fullName || !email || !admissionNumber) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError('Invalid email format', 400));
  }

  if (!validateAdmissionNumber(admissionNumber)) {
    return next(new AppError('Invalid admission number format (e.g., 025J/1000)', 400));
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { admissionNumber: admissionNumber.toUpperCase() }],
  });

  if (existingUser) {
    return next(new AppError('Email or admission number already exists', 400));
  }

  const plan = amountPaid >= 200 ? 'premium' : 'basic';

  const student = await User.create({
    fullName,
    email: email.toLowerCase(),
    admissionNumber: admissionNumber.toUpperCase(),
    amountPaid: amountPaid || 0,
    transactionId,
    assignedCourse,
    assignedInstructor,
    role: 'student',
    plan,
    status: 'pending',
  });

  if (assignedCourse) {
    await Course.findByIdAndUpdate(assignedCourse, {
      $inc: { totalStudents: 1 },
    });
  }

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'account_created',
    description: `Created student account: ${student.email}`,
    ...clientInfo,
    metadata: { studentId: student._id },
  });

  res.status(201).json({
    success: true,
    message: 'Student account created successfully',
    data: student,
  });
});

export const createInstructor = asyncHandler(async (req, res, next) => {
  const { fullName, email, assignedCourse } = req.body;

  if (!fullName || !email) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError('Invalid email format', 400));
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return next(new AppError('Email already exists', 400));
  }

  let accountNumber;
  let isUnique = false;

  while (!isUnique) {
    accountNumber = generateAccountNumber();
    const existing = await User.findOne({ accountNumber });
    if (!existing) isUnique = true;
  }

  const instructor = await User.create({
    fullName,
    email: email.toLowerCase(),
    accountNumber,
    assignedCourse,
    role: 'instructor',
    status: 'pending',
  });

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'account_created',
    description: `Created instructor account: ${instructor.email}`,
    ...clientInfo,
    metadata: { instructorId: instructor._id },
  });

  res.status(201).json({
    success: true,
    message: 'Instructor account created successfully',
    data: instructor,
  });
});

export const getAllStudents = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search, course, plan, status } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = { role: 'student', isDeleted: false };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { admissionNumber: { $regex: search, $options: 'i' } },
    ];
  }

  if (course) query.assignedCourse = course;
  if (plan) query.plan = plan;
  if (status) query.status = status;

  const total = await User.countDocuments(query);
  const students = await User.find(query)
    .populate('assignedCourse', 'name')
    .populate('assignedInstructor', 'fullName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(students, total, page, limitNum),
  });
});

export const getAllInstructors = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = { role: 'instructor', isDeleted: false };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { accountNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const instructors = await User.find(query)
    .populate('assignedCourse', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(instructors, total, page, limitNum),
  });
});

export const blockUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role === 'super_admin' || user.role === 'admin') {
    return next(new AppError('Cannot block admin users', 403));
  }

  user.status = 'blocked';
  await user.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'account_blocked',
    description: `Blocked user: ${user.email}`,
    ...clientInfo,
    metadata: { blockedUserId: userId },
    severity: 'warning',
  });

  res.status(200).json({
    success: true,
    message: 'User blocked successfully',
  });
});

export const unblockUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.status = 'active';
  await user.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Unblocked user: ${user.email}`,
    ...clientInfo,
    metadata: { unblockedUserId: userId },
  });

  res.status(200).json({
    success: true,
    message: 'User unblocked successfully',
  });
});

export const upgradeToPremium = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { amountPaid, transactionId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role !== 'student') {
    return next(new AppError('Only students can be upgraded to premium', 400));
  }

  user.plan = 'premium';
  user.amountPaid = amountPaid;
  user.transactionId = transactionId;
  await user.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'premium_upgrade',
    description: `Upgraded user to premium: ${user.email}`,
    ...clientInfo,
    metadata: { upgradedUserId: userId, amountPaid, transactionId },
  });

  res.status(200).json({
    success: true,
    message: 'User upgraded to premium successfully',
    data: user,
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalStudents = await User.countDocuments({ role: 'student', isDeleted: false });
  const premiumUsers = await User.countDocuments({ role: 'student', plan: 'premium', isDeleted: false });
  const totalInstructors = await User.countDocuments({ role: 'instructor', isDeleted: false });
  const totalCourses = await Course.countDocuments({ isDeleted: false });
  const activeChallenges = await Challenge.countDocuments({ status: 'active', isDeleted: false });

  const recentActivities = await ActivityLog.find()
    .populate('user', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      premiumUsers,
      totalInstructors,
      totalCourses,
      activeChallenges,
      recentActivities,
    },
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role === 'super_admin' || user.role === 'admin') {
    return next(new AppError('Cannot delete admin users', 403));
  }

  user.isDeleted = true;
  await user.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Deleted user: ${user.email}`,
    ...clientInfo,
    metadata: { deletedUserId: userId },
    severity: 'warning',
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
