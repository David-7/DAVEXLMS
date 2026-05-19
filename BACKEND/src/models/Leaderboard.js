import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  monthlyPoints: {
    type: Number,
    default: 0,
  },
  loginPoints: {
    type: Number,
    default: 0,
  },
  challengePoints: {
    type: Number,
    default: 0,
  },
  challengesCompleted: {
    type: Number,
    default: 0,
  },
  lastMonthlyReset: {
    type: Date,
    default: Date.now,
  },
  badges: [{
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
    },
  }],
  rank: {
    type: Number,
  },
  weeklyRank: {
    type: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

leaderboardEntrySchema.index({ totalPoints: -1 });
leaderboardEntrySchema.index({ weeklyPoints: -1 });
leaderboardEntrySchema.index({ student: 1 }, { unique: true });

const Leaderboard = mongoose.model('Leaderboard', leaderboardEntrySchema);

export default Leaderboard;
