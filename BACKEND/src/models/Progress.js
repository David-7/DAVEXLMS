import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lessonsCompleted: [{
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    topicsCompleted: [{
      topic: {
        type: mongoose.Schema.Types.ObjectId,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ student: 1, course: 1 }, { unique: true });
progressSchema.index({ student: 1 });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
