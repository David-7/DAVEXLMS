import Schedule from '../models/Schedule.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { paginate, buildPaginationResponse } from '../utils/helpers.js';

export const createSchedule = asyncHandler(async (req, res, next) => {
  const { date, time, venue, topic, instructor, course, requiredMaterials } = req.body;

  if (!date || !time || !venue || !topic || !instructor || !course) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const schedule = await Schedule.create({
    date,
    time,
    venue,
    topic,
    instructor,
    course,
    requiredMaterials,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Schedule created successfully',
    data: schedule,
  });
});

export const getSchedules = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, course, instructor, status } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = { isDeleted: false };

  if (course) query.course = course;
  if (instructor) query.instructor = instructor;
  if (status) query.status = status;

  if (req.user.role === 'student' && req.user.assignedCourse) {
    query.course = req.user.assignedCourse;
  }

  if (req.user.role === 'instructor') {
    query.instructor = req.user._id;
  }

  const total = await Schedule.countDocuments(query);
  const schedules = await Schedule.find(query)
    .populate('instructor', 'fullName')
    .populate('course', 'name')
    .sort({ date: 1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(schedules, total, page, limitNum),
  });
});

export const updateSchedule = asyncHandler(async (req, res, next) => {
  const { scheduleId } = req.params;
  const updates = req.body;

  const schedule = await Schedule.findOne({ _id: scheduleId, isDeleted: false });

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      schedule[key] = updates[key];
    }
  });

  await schedule.save();

  res.status(200).json({
    success: true,
    message: 'Schedule updated successfully',
    data: schedule,
  });
});

export const deleteSchedule = asyncHandler(async (req, res, next) => {
  const { scheduleId } = req.params;

  const schedule = await Schedule.findById(scheduleId);

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  schedule.isDeleted = true;
  await schedule.save();

  res.status(200).json({
    success: true,
    message: 'Schedule deleted successfully',
  });
});
