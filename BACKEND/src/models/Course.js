import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  topics: [{
    title: {
      type: String,
      required: true,
    },
    isCovered: {
      type: Boolean,
      default: false,
    },
    coveredAt: {
      type: Date,
    },
  }],
  resources: [{
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'link', 'video', 'document'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  order: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true,
      maxlength: [200, 'Course name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    duration: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    lessons: [lessonSchema],
    status: {
      type: String,
      enum: ['active', 'archived', 'draft'],
      default: 'active',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    totalStudents: {
      type: Number,
      default: 0,
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

courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });

courseSchema.virtual('lessonCount').get(function () {
  return this.lessons ? this.lessons.length : 0;
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
