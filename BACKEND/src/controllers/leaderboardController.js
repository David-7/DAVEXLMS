import Leaderboard from '../models/Leaderboard.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { paginate, buildPaginationResponse } from '../utils/helpers.js';

export const getLeaderboard = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, type = 'all' } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const sortField = type === 'weekly' ? 'weeklyPoints' : 'totalPoints';

  const total = await Leaderboard.countDocuments();
  const leaderboard = await Leaderboard.find()
    .populate('student', 'fullName admissionNumber profilePhoto plan')
    .sort({ [sortField]: -1 })
    .skip(skip)
    .limit(limitNum);

  const leaderboardWithRanks = leaderboard.map((entry, index) => ({
    ...entry.toObject(),
    rank: skip + index + 1,
  }));

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(leaderboardWithRanks, total, page, limitNum),
  });
});

export const getMyRank = asyncHandler(async (req, res, next) => {
  const myEntry = await Leaderboard.findOne({ student: req.user._id })
    .populate('student', 'fullName admissionNumber profilePhoto plan');

  if (!myEntry) {
    return res.status(200).json({
      success: true,
      data: {
        rank: null,
        weeklyRank: null,
        totalPoints: 0,
        weeklyPoints: 0,
        challengesCompleted: 0,
        badges: [],
      },
    });
  }

  const overallRank = await Leaderboard.countDocuments({
    totalPoints: { $gt: myEntry.totalPoints },
  });

  const weeklyRank = await Leaderboard.countDocuments({
    weeklyPoints: { $gt: myEntry.weeklyPoints },
  });

  res.status(200).json({
    success: true,
    data: {
      ...myEntry.toObject(),
      rank: overallRank + 1,
      weeklyRank: weeklyRank + 1,
    },
  });
});

export const awardBadge = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { name, description, icon } = req.body;

  if (!name) {
    return next(new AppError('Badge name is required', 400));
  }

  let leaderboard = await Leaderboard.findOne({ student: studentId });

  if (!leaderboard) {
    leaderboard = await Leaderboard.create({
      student: studentId,
      totalPoints: 0,
      weeklyPoints: 0,
      challengesCompleted: 0,
    });
  }

  const existingBadge = leaderboard.badges.find((badge) => badge.name === name);

  if (existingBadge) {
    return next(new AppError('Badge already awarded', 400));
  }

  leaderboard.badges.push({
    name,
    description,
    icon,
  });

  await leaderboard.save();

  res.status(200).json({
    success: true,
    message: 'Badge awarded successfully',
    data: leaderboard,
  });
});
