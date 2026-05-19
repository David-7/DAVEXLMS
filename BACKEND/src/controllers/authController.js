import User from '../models/User.js';
import Leaderboard from '../models/Leaderboard.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { sendTokenResponse, verifyRefreshToken, generateAccessToken } from '../utils/jwt.js';
import { validatePassword } from '../middleware/validator.js';
import { logActivity, getClientInfo } from '../utils/activityLogger.js';
import crypto from 'crypto';

export const login = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new AppError('Please provide identifier and password', 400));
  }

  let user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { accountNumber: identifier },
      { admissionNumber: identifier.toUpperCase() },
    ],
  }).select('+password');

  if (!user) {
    const clientInfo = getClientInfo(req);
    await logActivity({
      action: 'failed_login',
      description: `Failed login attempt for identifier: ${identifier}`,
      ...clientInfo,
      severity: 'warning',
    });
    return next(new AppError('Invalid credentials', 401));
  }

  if (user.isLocked) {
    return next(new AppError('Account temporarily locked due to multiple failed attempts. Try again later.', 423));
  }

  if (user.status === 'blocked' || user.status === 'suspended') {
    return next(new AppError('Account blocked, please contact admin', 403));
  }

  if (user.status === 'pending') {
    return next(new AppError('Account pending activation. Please set up your password first.', 403));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await user.incLoginAttempts();
    
    const clientInfo = getClientInfo(req);
    await logActivity({
      user: user._id,
      action: 'failed_login',
      description: 'Invalid password attempt',
      ...clientInfo,
      severity: 'warning',
    });

    return next(new AppError('Invalid credentials', 401));
  }

  await user.resetLoginAttempts();
  user.lastLogin = Date.now();
  
  const today = new Date().toISOString().split('T')[0];
  const isNewLoginToday = user.lastLoginDate !== today;
  
  if (isNewLoginToday) {
    user.lastLoginDate = today;
  }
  
  await user.save();

  if (user.role === 'student' && isNewLoginToday) {
    let leaderboardEntry = await Leaderboard.findOne({ student: user._id });
    
    if (!leaderboardEntry) {
      leaderboardEntry = await Leaderboard.create({
        student: user._id,
        loginPoints: 1,
        monthlyPoints: 1,
        totalPoints: 1,
      });
    } else {
      leaderboardEntry.loginPoints += 1;
      leaderboardEntry.monthlyPoints += 1;
      leaderboardEntry.totalPoints += 1;
      leaderboardEntry.lastUpdated = Date.now();
      await leaderboardEntry.save();
    }
  }

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: user._id,
    action: 'login',
    description: 'User logged in successfully',
    ...clientInfo,
  });

  sendTokenResponse(user, 200, res);
});

export const activateAccount = asyncHandler(async (req, res, next) => {
  const { identifier, password, confirmPassword } = req.body;

  if (!identifier || !password || !confirmPassword) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  const user = await User.findOne({
    $or: [
      { admissionNumber: identifier.toUpperCase() },
      { accountNumber: identifier },
    ],
    status: 'pending',
  });

  if (!user) {
    return next(new AppError('Invalid account or account already activated', 400));
  }

  user.password = password;
  user.status = 'active';
  await user.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: user._id,
    action: 'account_activated',
    description: 'Account activated successfully',
    ...clientInfo,
  });

  sendTokenResponse(user, 200, res);
});

export const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email, identifier } = req.body;

  if (!email || !identifier) {
    return next(new AppError('Please provide email and account identifier', 400));
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    $or: [
      { admissionNumber: identifier.toUpperCase() },
      { accountNumber: identifier },
    ],
    status: 'active',
  });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If the account exists, a password reset link has been sent',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  await user.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: user._id,
    action: 'password_reset',
    description: 'Password reset requested',
    ...clientInfo,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    resetToken,
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken, password, confirmPassword } = req.body;

  if (!resetToken || !password || !confirmPassword) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: user._id,
    action: 'password_reset',
    description: 'Password reset completed',
    ...clientInfo,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token required', 400));
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const user = await User.findById(decoded.id);

  if (!user || user.status !== 'active') {
    return next(new AppError('User not found or inactive', 401));
  }

  const newAccessToken = generateAccessToken(user._id);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  const clientInfo = getClientInfo(req);
  await logActivity({
    user: req.user?._id,
    action: 'logout',
    description: 'User logged out',
    ...clientInfo,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('assignedCourse', 'name')
    .populate('assignedInstructor', 'fullName email');

  res.status(200).json({
    success: true,
    data: user,
  });
});
