import mongoose from 'mongoose';

const flashPrizeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Prize title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['airtime', 'coupon', 'access', 'bonus'],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    revealDate: {
      type: Date,
      required: true,
    },
    expiryDuration: {
      type: Number,
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    claimedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'claimed', 'expired'],
      default: 'pending',
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

flashPrizeSchema.index({ revealDate: 1, status: 1 });
flashPrizeSchema.index({ claimedBy: 1 });

const FlashPrize = mongoose.model('FlashPrize', flashPrizeSchema);

export default FlashPrize;
