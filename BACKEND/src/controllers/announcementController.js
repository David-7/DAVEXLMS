import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { paginate, buildPaginationResponse } from '../utils/helpers.js';

export const createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, content, priority, targetAudience, course, isPinned, expiresAt } = req.body;

  if (!title || !content) {
    return next(new AppError('Please provide title and content', 400));
  }

  const announcement = await Announcement.create({
    title,
    content,
    priority: priority || 'medium',
    targetAudience: targetAudience || 'all',
    course,
    isPinned: isPinned || false,
    expiresAt,
    createdBy: req.user._id,
  });

  const query = {};
  if (targetAudience === 'students') {
    query.role = 'student';
  } else if (targetAudience === 'instructors') {
    query.role = 'instructor';
  } else if (targetAudience === 'premium') {
    query.role = 'student';
    query.plan = 'premium';
  }

  if (course) {
    query.assignedCourse = course;
  }

  const recipients = await User.find(query).select('_id');

  const notifications = recipients.map((user) => ({
    recipient: user._id,
    type: 'announcement',
    title: announcement.title,
    message: announcement.content.substring(0, 200),
    priority: announcement.priority,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: announcement,
  });
});

export const getAnnouncements = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = {
    isDeleted: false,
    $or: [{ expiresAt: { $gte: new Date() } }, { expiresAt: null }],
  };

  if (req.user.role === 'student') {
    query.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'students' },
      ...(req.user.plan === 'premium' ? [{ targetAudience: 'premium' }] : []),
    ];

    if (req.user.assignedCourse) {
      query.$and = [
        {
          $or: [{ course: req.user.assignedCourse }, { course: null }],
        },
      ];
    }
  }

  const total = await Announcement.countDocuments(query);
  const announcements = await Announcement.find(query)
    .populate('createdBy', 'fullName role')
    .populate('course', 'name')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(announcements, total, page, limitNum),
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const { announcementId } = req.params;

  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  announcement.isDeleted = true;
  await announcement.save();

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully',
  });
});
