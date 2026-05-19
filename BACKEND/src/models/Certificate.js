import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    certificateUrl: {
      type: String,
      required: [true, 'Certificate URL is required'],
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    certificateType: {
      type: String,
      enum: ['completion', 'achievement', 'participation', 'excellence'],
      default: 'completion',
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ student: 1, issuedDate: -1 });
certificateSchema.index({ course: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
