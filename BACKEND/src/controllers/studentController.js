import User from '../models/User.js';
import Course from '../models/Course.js';
import Challenge from '../models/Challenge.js';
import Leaderboard from '../models/Leaderboard.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

export const getStudentProgress = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const student = await User.findById(studentId).populate('assignedCourse');
  
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  const leaderboardEntry = await Leaderboard.findOne({ student: studentId });
  
  const course = student.assignedCourse;
  let completedTopics = 0;
  let totalTopics = 0;
  
  if (course && course.lessons) {
    course.lessons.forEach(lesson => {
      if (lesson.topics) {
        totalTopics += lesson.topics.length;
        completedTopics += lesson.topics.filter(t => t.isCovered).length;
      }
    });
  }

  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const today = new Date();
  const weeksInMonth = 4;
  
  const weeklyData = Array.from({ length: weeksInMonth }, (_, i) => {
    const weekProgress = Math.min(progressPercentage, progressPercentage - ((weeksInMonth - 1 - i) * 10));
    const weekPoints = Math.floor((leaderboardEntry?.monthlyPoints || 0) / weeksInMonth * (i + 1));
    
    return {
      name: `Week ${i + 1}`,
      progress: Math.max(0, weekProgress),
      points: weekPoints,
      skillBattle: leaderboardEntry?.skillBattleWins || 0,
    };
  });

  res.status(200).json({
    success: true,
    data: weeklyData,
  });
});
