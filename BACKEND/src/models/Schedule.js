import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    day: {
      type: String,
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    venue: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    requiredMaterials: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ date: 1, course: 1 });
scheduleSchema.index({ instructor: 1 });
scheduleSchema.index({ status: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
