import FlashPrize from '../models/FlashPrize.js';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { logActivity, getClientInfo } from '../utils/activityLogger.js';

export const createFlashPrize = asyncHandler(async (req, res, next) => {
  const { title, description, type, value, revealDate, expiryDuration } = req.body;

  if (!title || !description || !type || !value || !revealDate || !expiryDuration) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const prize = await FlashPrize.create({
    title,
    description,
    type,
    value,
    revealDate,
    expiryDuration,
    createdBy: req.user._id,
    status: 'pending',
  });

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Created flash prize: ${prize.title}`,
    ...clientInfo,
    metadata: { prizeId: prize._id },
  });

  res.status(201).json({
    success: true,
    message: 'Flash prize created successfully',
    data: prize,
  });
});

export const getActivePrizes = asyncHandler(async (req, res, next) => {
  const now = new Date();

  const prizes = await FlashPrize.find({
    revealDate: { $lte: now },
    status: { $in: ['pending', 'active'] },
    isDeleted: false,
  }).sort({ revealDate: -1 });

  const activePrizes = prizes.map((prize) => {
    const expiryTime = new Date(prize.revealDate).getTime() + prize.expiryDuration * 60000;
    const isExpired = Date.now() > expiryTime;

    if (isExpired && prize.status !== 'claimed') {
      prize.status = 'expired';
      prize.save();
    }

    return {
      ...prize.toObject(),
      isExpired,
      isClaimed: prize.status === 'claimed',
    };
  });

  res.status(200).json({
    success: true,
    data: activePrizes,
  });
});

export const claimPrize = asyncHandler(async (req, res, next) => {
  const { prizeId } = req.params;

  const prize = await FlashPrize.findOne({
    _id: prizeId,
    isDeleted: false,
  });

  if (!prize) {
    return next(new AppError('Prize not found', 404));
  }

  const now = Date.now();
  const revealTime = new Date(prize.revealDate).getTime();
  const expiryTime = revealTime + prize.expiryDuration * 60000;

  if (now < revealTime) {
    return next(new AppError('Prize not yet available', 400));
  }

  if (now > expiryTime) {
    prize.status = 'expired';
    await prize.save();
    return next(new AppError('Prize has expired', 400));
  }

  if (prize.status === 'claimed') {
    return next(new AppError('Prize already claimed', 400));
  }

  prize.claimedBy = req.user._id;
  prize.claimedAt = new Date();
  prize.status = 'claimed';
  await prize.save();

  await Notification.create({
    recipient: req.user._id,
    type: 'prize_claimed',
    title: 'Prize Claimed!',
    message: `Congratulations! You claimed: ${prize.title}`,
    priority: 'high',
  });

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user._id,
    action: 'admin_action',
    description: `Claimed flash prize: ${prize.title}`,
    ...clientInfo,
    metadata: { prizeId: prize._id },
  });

  res.status(200).json({
    success: true,
    message: 'Prize claimed successfully!',
    data: prize,
  });
});

export const getAllPrizes = asyncHandler(async (req, res, next) => {
  const prizes = await FlashPrize.find({ isDeleted: false })
    .populate('claimedBy', 'fullName admissionNumber')
    .populate('createdBy', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: prizes,
  });
});

export const deletePrize = asyncHandler(async (req, res, next) => {
  const { prizeId } = req.params;

  const prize = await FlashPrize.findById(prizeId);

  if (!prize) {
    return next(new AppError('Prize not found', 404));
  }

  prize.isDeleted = true;
  await prize.save();

  res.status(200).json({
    success: true,
    message: 'Prize deleted successfully',
  });
});
