import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'correct', 'partial', 'incorrect'],
    default: 'pending',
  },
  pointsAwarded: {
    type: Number,
    default: 0,
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  evaluatedAt: {
    type: Date,
  },
  feedback: {
    type: String,
  },
});

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['question', 'troubleshooting', 'practical', 'coding'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submissions: [submissionSchema],
    status: {
      type: String,
      enum: ['draft', 'active', 'expired', 'archived'],
      default: 'draft',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

challengeSchema.index({ startDate: 1, expiryDate: 1 });
challengeSchema.index({ status: 1 });
challengeSchema.index({ course: 1 });

challengeSchema.virtual('isExpired').get(function () {
  return Date.now() > this.expiryDate;
});

challengeSchema.virtual('isActive').get(function () {
  const now = Date.now();
  return now >= this.startDate && now <= this.expiryDate && this.status === 'active';
});

challengeSchema.virtual('submissionCount').get(function () {
  return this.submissions ? this.submissions.length : 0;
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;
