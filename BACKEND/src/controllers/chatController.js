import Message from '../models/Message.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { paginate, buildPaginationResponse } from '../utils/helpers.js';

export const getMessages = asyncHandler(async (req, res, next) => {
  const { room = 'general', roomId, page = 1, limit = 50 } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);

  const query = { isDeleted: false, room };
  if (roomId) query.roomId = roomId;

  const total = await Message.countDocuments(query);
  const messages = await Message.find(query)
    .populate('sender', 'fullName role')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(messages, total, page, limitNum),
  });
});

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { content, room = 'general', roomId } = req.body;

  if (!content || !content.trim()) {
    return next(new AppError('Message content is required', 400));
  }

  const message = await Message.create({
    sender: req.user._id,
    content: content.trim(),
    room,
    roomId,
  });

  await message.populate('sender', 'fullName role');

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: message,
  });
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return next(new AppError('Not authorized to delete this message', 403));
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
  });
});
