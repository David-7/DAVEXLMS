import Challenge from '../models/Challenge.js';
import Leaderboard from '../models/Leaderboard.js';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { paginate, buildPaginationResponse, isExpired } from '../utils/helpers.js';
import { logActivity, getClientInfo } from '../utils/activityLogger.js';

export const createChallenge = asyncHandler(async (req, res, next) => {
  const { title, description, type, difficulty, points, startDate, expiryDate, course } = req.body;

  if (!title || !description || !type || !points || !startDate || !expiryDate) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (new Date(expiryDate) <= new Date(startDate)) {
    return next(new AppError('Expiry date must be after start date', 400));
  }

  const challenge = await Challenge.create({
    title,
    description,
    type,
    difficulty,
    points,
    startDate,
    expiryDate,
    course,
    createdBy: req.user._id,
    status: 'active',
  });

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Created challenge: ${challenge.title}`,
    ...clientInfo,
    metadata: { challengeId: challenge._id },
  });

  res.status(201).json({
    success: true,
    message: 'Challenge created successfully',
    data: challenge,
  });
});

export const getAllChallenges = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status, type, course } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = { isDeleted: false };

  if (status) query.status = status;
  if (type) query.type = type;
  if (course) query.course = course;

  if (req.user.role === 'student' && req.user.assignedCourse) {
    query.course = req.user.assignedCourse;
  }

  const total = await Challenge.countDocuments(query);
  const challenges = await Challenge.find(query)
    .populate('course', 'name')
    .populate('createdBy', 'fullName')
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(challenges, total, page, limitNum),
  });
});

export const getChallengeById = asyncHandler(async (req, res, next) => {
  const { challengeId } = req.params;

  const challenge = await Challenge.findOne({ _id: challengeId, isDeleted: false })
    .populate('course', 'name')
    .populate('createdBy', 'fullName')
    .populate('submissions.student', 'fullName admissionNumber')
    .populate('submissions.evaluatedBy', 'fullName');

  if (!challenge) {
    return next(new AppError('Challenge not found', 404));
  }

  if (req.user.role === 'student') {
    const userSubmission = challenge.submissions.find(
      (sub) => sub.student._id.toString() === req.user._id.toString()
    );

    return res.status(200).json({
      success: true,
      data: {
        ...challenge.toObject(),
        userSubmission,
        submissions: undefined,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: challenge,
  });
});

export const submitChallenge = asyncHandler(async (req, res, next) => {
  const { challengeId } = req.params;
  const { answer } = req.body;

  if (!answer || answer.trim().length === 0) {
    return next(new AppError('Answer is required', 400));
  }

  const challenge = await Challenge.findOne({ _id: challengeId, isDeleted: false });

  if (!challenge) {
    return next(new AppError('Challenge not found', 404));
  }

  if (challenge.status !== 'active') {
    return next(new AppError('Challenge is not active', 400));
  }

  if (isExpired(challenge.expiryDate)) {
    return next(new AppError('Skill session passed or expired. Try next time.', 400));
  }

  const existingSubmission = challenge.submissions.find(
    (sub) => sub.student.toString() === req.user._id.toString()
  );

  if (existingSubmission) {
    return next(new AppError('You have already submitted this challenge', 400));
  }

  challenge.submissions.push({
    student: req.user._id,
    answer: answer.trim(),
    status: 'pending',
  });

  await challenge.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'challenge_submitted',
    description: `Submitted challenge: ${challenge.title}`,
    ...clientInfo,
    metadata: { challengeId: challenge._id },
  });

  res.status(201).json({
    success: true,
    message: 'Your submission has been received. Results will appear after mentor evaluation.',
  });
});

export const deleteChallenge = asyncHandler(async (req, res, next) => {
  const { challengeId } = req.params;

  const challenge = await Challenge.findById(challengeId);

  if (!challenge) {
    return next(new AppError('Challenge not found', 404));
  }

  challenge.isDeleted = true;
  await challenge.save();

  res.status(200).json({
    success: true,
    message: 'Challenge deleted successfully',
  });
});

export const gradeSubmission = asyncHandler(async (req, res, next) => {
  const { challengeId, submissionId } = req.params;
  const { pointsAwarded, status, feedback } = req.body;

  const challenge = await Challenge.findOne({ _id: challengeId, isDeleted: false });

  if (!challenge) {
    return next(new AppError('Challenge not found', 404));
  }

  const submission = challenge.submissions.id(submissionId);

  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }

  if (submission.status !== 'pending') {
    return next(new AppError('Submission has already been graded', 400));
  }

  if (pointsAwarded > challenge.points) {
    return next(new AppError(`Points awarded cannot exceed ${challenge.points}`, 400));
  }

  submission.status = status || 'correct';
  submission.pointsAwarded = pointsAwarded || 0;
  submission.feedback = feedback;
  submission.evaluatedBy = req.user._id;
  submission.evaluatedAt = new Date();

  await challenge.save();

  if (pointsAwarded > 0) {
    let leaderboard = await Leaderboard.findOne({ student: submission.student });

    if (!leaderboard) {
      leaderboard = await Leaderboard.create({
        student: submission.student,
        totalPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        challengesCompleted: 0,
      });
    }

    leaderboard.totalPoints += pointsAwarded;
    leaderboard.weeklyPoints += pointsAwarded;
    leaderboard.monthlyPoints += pointsAwarded;
    leaderboard.challengesCompleted += 1;
    await leaderboard.save();

    await Notification.create({
      user: submission.student,
      title: 'Challenge Graded',
      message: `Your submission for "${challenge.title}" has been graded. You earned ${pointsAwarded} points!`,
      type: 'challenge',
      relatedId: challenge._id,
    });
  }

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'instructor_action',
    description: `Graded submission for challenge: ${challenge.title}`,
    ...clientInfo,
    metadata: { challengeId: challenge._id, pointsAwarded },
  });

  res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    data: challenge,
  });
});
