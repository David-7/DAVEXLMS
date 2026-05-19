import Course from '../models/Course.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { paginate, buildPaginationResponse } from '../utils/helpers.js';
import { logActivity, getClientInfo } from '../utils/activityLogger.js';

export const createCourse = asyncHandler(async (req, res, next) => {
  const { name, title, description, instructor, duration, level } = req.body;

  const courseName = name || title;

  if (!courseName) {
    return next(new AppError('Course name is required', 400));
  }

  const existingCourse = await Course.findOne({ name: courseName, isDeleted: false });

  if (existingCourse) {
    return next(new AppError('Course with this name already exists', 400));
  }

  const course = await Course.create({
    name: courseName,
    description,
    instructor,
    duration,
    level,
  });

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Created course: ${course.name}`,
    ...clientInfo,
    metadata: { courseId: course._id },
  });

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: course,
  });
});

export const getAllCourses = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = { isDeleted: false };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (status) {
    query.status = status;
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(courses, total, page, limitNum),
  });
});

export const getCourseById = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findOne({ _id: courseId, isDeleted: false })
    .populate('instructor', 'fullName email')
    .populate('lessons.createdBy', 'fullName');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { name, description, instructor, status } = req.body;

  const course = await Course.findOne({ _id: courseId, isDeleted: false });

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (name) course.name = name;
  if (description) course.description = description;
  if (instructor) course.instructor = instructor;
  if (status) course.status = status;

  await course.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Updated course: ${course.name}`,
    ...clientInfo,
    metadata: { courseId: course._id },
  });

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: course,
  });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  course.isDeleted = true;
  await course.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Deleted course: ${course.name}`,
    ...clientInfo,
    metadata: { courseId: course._id },
    severity: 'warning',
  });

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

export const addLesson = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, description, topics } = req.body;

  if (!title) {
    return next(new AppError('Lesson title is required', 400));
  }

  const course = await Course.findOne({ _id: courseId, isDeleted: false });

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to add lessons to this course', 403));
  }

  const lesson = {
    title,
    description,
    topics: topics || [],
    order: course.lessons.length + 1,
    createdBy: req.user._id,
  };

  course.lessons.push(lesson);
  await course.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'instructor_action',
    description: `Added lesson "${title}" to course: ${course.name}`,
    ...clientInfo,
    metadata: { courseId: course._id },
  });

  res.status(201).json({
    success: true,
    message: 'Lesson added successfully',
    data: course,
  });
});

export const markTopicCovered = asyncHandler(async (req, res, next) => {
  const { courseId, lessonId, topicId } = req.params;
  const isUnmarking = req.path.includes('unmark-covered');

  const course = await Course.findOne({ _id: courseId, isDeleted: false });

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to modify this course', 403));
  }

  const lesson = course.lessons.id(lessonId);

  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  const topic = lesson.topics.id(topicId);

  if (!topic) {
    return next(new AppError('Topic not found', 404));
  }

  if (isUnmarking) {
    topic.isCovered = false;
    topic.coveredAt = null;
  } else {
    topic.isCovered = true;
    topic.coveredAt = new Date();
  }

  await course.save();

  res.status(200).json({
    success: true,
    message: isUnmarking ? 'Topic unmarked' : 'Topic marked as covered',
    data: course,
  });
});

export const addResource = asyncHandler(async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const { title, type, url, isPremium } = req.body;

  if (!title || !type || !url) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const course = await Course.findOne({ _id: courseId, isDeleted: false });

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to add resources to this course', 403));
  }

  const lesson = course.lessons.id(lessonId);

  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  lesson.resources.push({
    title,
    type,
    url,
    isPremium: isPremium || false,
  });

  await course.save();

  res.status(201).json({
    success: true,
    message: 'Resource added successfully',
    data: course,
  });
});
